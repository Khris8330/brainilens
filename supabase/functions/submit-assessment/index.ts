import { createSupabaseContext } from "npm:@supabase/server@^1";

type SubmitAssessmentRequest = {
  assignmentId: string;
  sectionId: string;
  answer: unknown;
};

type AssessmentResult = {
  isCorrect: boolean;
  score: number;
};

const MAX_ANSWER_LENGTH = 10_000;

function isUuid(value: unknown): value is string {
  if (typeof value !== "string") return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return Response.json(body, { status });
}

function errorResponse(
  code: string,
  message: string,
  status: number,
): Response {
  return jsonResponse(
    {
      error: {
        code,
        message,
      },
    },
    status,
  );
}

function normalizeAnswer(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function inferAssessmentType(section: Record<string, unknown>): string {
  const assessment = section.assessment;
  if (assessment && typeof assessment === "object" && !Array.isArray(assessment)) {
    const type = (assessment as Record<string, unknown>).type;
    if (typeof type === "string" && type.trim()) return type;
  }

  const correctAnswer = section.correct_answer;
  if (Array.isArray(section.options)) return "multiple_choice";
  if (typeof correctAnswer === "boolean" || ["true", "false"].includes(String(correctAnswer).toLowerCase())) return "true_false";
  if (typeof correctAnswer === "number" || (typeof correctAnswer === "string" && correctAnswer.trim() !== "" && Number.isFinite(Number(correctAnswer)))) return "numeric";
  return "short_answer";
}

function normalizeAssessmentSection(section: Record<string, unknown>): Record<string, unknown> | null {
  const nested = section.assessment;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }

  if (!("correct_answer" in section)) return null;

  return {
    type: inferAssessmentType(section),
    correctAnswer: section.correct_answer,
    acceptedAnswers: Array.isArray(section.accepted_answers)
      ? section.accepted_answers
      : [section.correct_answer],
  };
}

function evaluateAssessment(
  assessment: Record<string, unknown>,
  answer: unknown,
): AssessmentResult {
  const type = assessment.type;

  /*
   * These are intentionally the first-pass evaluators.
   *
   * The lesson JSON schema will be the source of truth for
   * the exact assessment properties.
   */

  switch (type) {
    case "multiple_choice": {
      const selected = normalizeAnswer(answer);
      const correct = normalizeAnswer(
        assessment.correctAnswer,
      );

      const isCorrect =
        selected.toLowerCase() === correct.toLowerCase();

      return {
        isCorrect,
        score: isCorrect ? 100 : 0,
      };
    }

    case "true_false": {
      const selected = normalizeAnswer(answer).toLowerCase();
      const correct = normalizeAnswer(
        assessment.correctAnswer,
      ).toLowerCase();

      const isCorrect = selected === correct;

      return {
        isCorrect,
        score: isCorrect ? 100 : 0,
      };
    }

    case "numeric": {
      const studentValue = Number(answer);
      const correctValue = Number(assessment.correctAnswer);

      if (
        !Number.isFinite(studentValue) ||
        !Number.isFinite(correctValue)
      ) {
        return {
          isCorrect: false,
          score: 0,
        };
      }

      const tolerance =
        typeof assessment.tolerance === "number"
          ? assessment.tolerance
          : 0;

      const isCorrect =
        Math.abs(studentValue - correctValue) <= tolerance;

      return {
        isCorrect,
        score: isCorrect ? 100 : 0,
      };
    }

    case "short_answer": {
      /*
       * Final short-answer semantics will be implemented
       * from the finalized lesson JSON schema.
       *
       * We deliberately do not use crude exact-string
       * matching here.
       */

      const studentAnswer = normalizeAnswer(answer)
        .toLowerCase();

      const acceptedAnswers = Array.isArray(
        assessment.acceptedAnswers,
      )
        ? assessment.acceptedAnswers
        : [];

      const normalizedAccepted = acceptedAnswers
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().toLowerCase());

      const isCorrect =
        normalizedAccepted.includes(studentAnswer);

      return {
        isCorrect,
        score: isCorrect ? 100 : 0,
      };
    }

    case "open_ended": {
      /*
       * Open-ended/rubric evaluation will be finalized
       * with the assessment schema.
       *
       * We do not pretend to have AI grading here.
       */

      return {
        isCorrect: false,
        score: 0,
      };
    }

    default:
      throw new Error("UNSUPPORTED_ASSESSMENT_TYPE");
  }
}

export default {
  fetch: async (req) => {
    const { data: ctx, error } = await createSupabaseContext(
      req,
      { auth: "user" },
    );

    return jsonResponse({
      contextError: Boolean(error),
      errorCode: error?.code ?? null,
      errorMessage: error?.message ?? null,
      errorStatus: error?.status ?? null,
      hasUserClaims: Boolean(ctx?.userClaims),
      hasUserIdClaim: Boolean(ctx?.userClaims?.sub),
      hasJwtClaims: Boolean(ctx?.jwtClaims),
      authMode: ctx?.authMode ?? null,
    });

    if (req.method !== "POST") {
        return errorResponse(
          "METHOD_NOT_ALLOWED",
          "Only POST requests are allowed.",
          405,
        );
      }

      let body: SubmitAssessmentRequest;

      try {
        body = await req.json();
      } catch {
        return errorResponse(
          "INVALID_JSON",
          "Request body must contain valid JSON.",
          400,
        );
      }

      const {
        assignmentId,
        sectionId,
        answer,
      } = body ?? {};

      // ------------------------------------------------------
      // Request validation
      // ------------------------------------------------------

      if (!isUuid(assignmentId)) {
        return errorResponse(
          "INVALID_ASSIGNMENT_ID",
          "assignmentId must be a valid UUID.",
          400,
        );
      }

      if (
        typeof sectionId !== "string" ||
        sectionId.trim().length === 0
      ) {
        return errorResponse(
          "INVALID_SECTION_ID",
          "sectionId is required.",
          400,
        );
      }

      const normalizedAnswer = normalizeAnswer(answer);

      if (normalizedAnswer.length > MAX_ANSWER_LENGTH) {
        return errorResponse(
          "ANSWER_TOO_LONG",
          "The submitted answer is too long.",
          400,
        );
      }

      // ------------------------------------------------------
      // Authenticated user
      // ------------------------------------------------------

      const userId = ctx.userClaims?.sub;

      if (!userId) {
        return errorResponse(
          "UNAUTHENTICATED",
          "Authentication is required.",
          401,
        );
      }

      // ------------------------------------------------------
      // Resolve student
      // ------------------------------------------------------

      const {
        data: student,
        error: studentError,
      } = await ctx.supabase
        .from("students")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (studentError) {
        console.error(
          "Student lookup failed:",
          studentError,
        );

        return errorResponse(
          "DATABASE_ERROR",
          "Unable to resolve the student.",
          500,
        );
      }

      if (!student) {
        return errorResponse(
          "STUDENT_NOT_FOUND",
          "No student profile is associated with this account.",
          403,
        );
      }

      // ------------------------------------------------------
      // Verify assignment belongs to student
      // ------------------------------------------------------

      const {
        data: assignmentLink,
        error: assignmentLinkError,
      } = await ctx.supabase
        .from("student_assignments")
        .select("assignment_id")
        .eq("student_id", student.id)
        .eq("assignment_id", assignmentId)
        .maybeSingle();

      if (assignmentLinkError) {
        console.error(
          "Assignment ownership lookup failed:",
          assignmentLinkError,
        );

        return errorResponse(
          "DATABASE_ERROR",
          "Unable to verify assignment ownership.",
          500,
        );
      }

      if (!assignmentLink) {
        return errorResponse(
          "ASSIGNMENT_NOT_ASSIGNED",
          "This assignment is not assigned to this student.",
          403,
        );
      }

      // ------------------------------------------------------
      // Load assignment + learning content
      // ------------------------------------------------------

      const {
        data: assignment,
        error: assignmentError,
      } = await ctx.supabase
        .from("assignments")
        .select(`
          id,
          learning_content_id,
          learning_content (
            id,
            title,
            subject,
            grade,
            content
          )
        `)
        .eq("id", assignmentId)
        .maybeSingle();

      if (assignmentError) {
        console.error(
          "Assignment lookup failed:",
          assignmentError,
        );

        return errorResponse(
          "DATABASE_ERROR",
          "Unable to load the assignment.",
          500,
        );
      }

      if (!assignment) {
        return errorResponse(
          "ASSIGNMENT_NOT_FOUND",
          "Assignment not found.",
          404,
        );
      }

      const learningContent = Array.isArray(
        assignment.learning_content,
      )
        ? assignment.learning_content[0]
        : assignment.learning_content;

      if (!learningContent) {
        return errorResponse(
          "INVALID_LESSON_CONTENT",
          "This assignment does not have learning content.",
          500,
        );
      }

      // ------------------------------------------------------
      // Parse lesson JSON
      // ------------------------------------------------------

      let lesson: Record<string, unknown>;

      try {
        if (
          typeof learningContent.content !== "string" ||
          learningContent.content.trim().length === 0
        ) {
          throw new Error("EMPTY_CONTENT");
        }

        lesson = JSON.parse(learningContent.content);
      } catch {
        return errorResponse(
          "INVALID_LESSON_CONTENT",
          "The lesson content is missing or invalid.",
          500,
        );
      }

      if (!lesson || typeof lesson !== "object") {
        return errorResponse(
          "INVALID_LESSON_CONTENT",
          "The lesson content has an invalid structure.",
          500,
        );
      }

      // ------------------------------------------------------
      // Locate assessment section
      // ------------------------------------------------------

      const sections = Array.isArray(lesson.sections)
        ? lesson.sections
        : [];

      const section = sections.find(
        (item) =>
          item &&
          typeof item === "object" &&
          (item as Record<string, unknown>).id === sectionId,
      ) as Record<string, unknown> | undefined;

      if (!section) {
        return errorResponse(
          "INVALID_SECTION",
          "The requested assessment section does not exist.",
          400,
        );
      }

      if (section.type !== "practice") {
        return errorResponse(
          "SECTION_NOT_ASSESSABLE",
          "The requested section is not an assessment section.",
          400,
        );
      }

      const assessment = normalizeAssessmentSection(section);

      if (!assessment) {
        return errorResponse(
          "SECTION_NOT_ASSESSABLE",
          "The requested section has no assessment.",
          400,
        );
      }

      // ------------------------------------------------------
      // Evaluate answer
      // ------------------------------------------------------

      let result: AssessmentResult;

      try {
        result = evaluateAssessment(
          assessment,
          answer,
        );
      } catch (error) {
        console.error(
          "Assessment evaluation failed:",
          error,
        );

        return errorResponse(
          "UNSUPPORTED_ASSESSMENT_TYPE",
          "This assessment type is not currently supported.",
          400,
        );
      }

      // ------------------------------------------------------
      // Determine assessment-section counts
      //
      // IMPORTANT:
      // This is temporary until the finalized lesson schema
      // defines exactly how assessment sections are identified.
      // ------------------------------------------------------

      const assessmentSections = sections.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          (item as Record<string, unknown>).type === "practice" &&
          normalizeAssessmentSection(item as Record<string, unknown>) !== null,
      );

      const totalAssessmentSections =
        assessmentSections.length;

      if (totalAssessmentSections < 1) {
        return errorResponse(
          "INVALID_LESSON_CONTENT",
          "The lesson contains no assessable sections.",
          500,
        );
      }

      // ------------------------------------------------------
      // Determine which sections have already been attempted.
      //
      // This query uses the authenticated student's RLS scope.
      // ------------------------------------------------------

      const {
        data: previousAttempts,
        error: previousAttemptsError,
      } = await ctx.supabase
        .from("student_assessment_attempts")
        .select("section_id")
        .eq("student_id", student.id)
        .eq(
          "learning_content_id",
          learningContent.id,
        )
        .eq(
          "assignment_id",
          assignmentId,
        );

      if (previousAttemptsError) {
        console.error(
          "Previous attempts lookup failed:",
          previousAttemptsError,
        );

        return errorResponse(
          "DATABASE_ERROR",
          "Unable to determine assessment progress.",
          500,
        );
      }

      const completedSectionIds =
        new Set(
          (previousAttempts ?? []).map(
            (item) => item.section_id,
          ),
        );

      completedSectionIds.add(sectionId);

      const completedAssessmentSections =
        completedSectionIds.size;

      // ------------------------------------------------------
      // Call privileged atomic RPC
      //
      // The RPC itself is not exposed to authenticated clients.
      // It is executed with the server-side admin context.
      // ------------------------------------------------------

      const {
        data: persistenceResult,
        error: persistenceError,
      } = await ctx.supabaseAdmin.rpc(
        "record_assessment_attempt",
        {
          p_student_id: student.id,
          p_assignment_id: assignmentId,
          p_learning_content_id: learningContent.id,
          p_section_id: sectionId,
          p_answer: normalizedAnswer,
          p_is_correct: result.isCorrect,
          p_score: result.score,
          p_total_assessment_sections:
            totalAssessmentSections,
          p_completed_assessment_sections:
            completedAssessmentSections,
        },
      );

      if (persistenceError) {
        console.error(
          "Assessment persistence failed:",
          persistenceError,
        );

        const message =
          persistenceError.message ?? "";

        if (
          message.includes(
            "MAX_ATTEMPTS_REACHED",
          )
        ) {
          return errorResponse(
            "MAX_ATTEMPTS_REACHED",
            "This assessment section has reached the maximum of 3 attempts.",
            409,
          );
        }

        if (
          message.includes(
            "ATTEMPT_CONFLICT",
          )
        ) {
          return errorResponse(
            "ATTEMPT_CONFLICT",
            "Another submission was processed at the same time. Please try again.",
            409,
          );
        }

        if (
          message.includes(
            "ASSIGNMENT_NOT_ASSIGNED",
          )
        ) {
          return errorResponse(
            "ASSIGNMENT_NOT_ASSIGNED",
            "This assignment is not assigned to this student.",
            403,
          );
        }

        if (
          message.includes(
            "ASSIGNMENT_CONTENT_MISMATCH",
          )
        ) {
          return errorResponse(
            "ASSIGNMENT_CONTENT_MISMATCH",
            "The assignment and lesson content do not match.",
            500,
          );
        }

        return errorResponse(
          "DATABASE_ERROR",
          "Unable to save the assessment result.",
          500,
        );
      }

      // ------------------------------------------------------
      // Success
      // ------------------------------------------------------

      return jsonResponse({
        success: true,
        data: persistenceResult,
  });
  },
};
