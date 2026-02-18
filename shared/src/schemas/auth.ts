import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  email: z.string().email("El correo electrónico no es válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  role: z.enum(["patient", "professional"]),
  terms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones.",
  }),
});

export type SignupInput = z.infer<typeof signupSchema>;
