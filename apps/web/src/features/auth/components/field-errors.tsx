function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
}

export function FieldErrors({ errors }: { errors: unknown[] }) {
  return errors.map((error) => {
    const message = getErrorMessage(error);

    if (!message) {
      return null;
    }

    return (
      <p className="text-destructive text-sm" key={message}>
        {message}
      </p>
    );
  });
}
