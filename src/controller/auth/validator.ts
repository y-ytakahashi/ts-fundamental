import {z} from "zod";

export const registerSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(8).max(16),
})

export type RegisterInput = z.infer<typeof registerSchema>