import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    return res.status(400).json({
      message: "Payload inválido",
      issues,
    });
  }

  return res.status(500).json({
    message: "Erro inesperado",
    details: err instanceof Error ? err.message : String(err),
  });
};
