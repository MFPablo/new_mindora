import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { signupSchema, type ApiResponse, type SignupInput } from "shared";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { authConfig, prisma } from "./auth";

export const app = new Hono<{
  Variables: {
    authUser: any
  }
}>()

.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}))
// @ts-ignore
.use("*", initAuthConfig((c) => authConfig))
// @ts-ignore
.use("/auth/*", authHandler())

.get("/", (c) => {
	return c.text("Hello Hono!");
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
.get("/protected", verifyAuth() as any, (c) => {
  const auth = c.get("authUser");
  return c.json({
    message: `Hello ${auth?.user?.name || "User"}!`,
    session: auth
  });
})

.get("/hello", async (c) => {
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};

	return c.json(data, { status: 200 });
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
.post("/api/signup", zValidator("json", signupSchema) as any, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = c.req.valid("json" as never) as SignupInput;
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return c.json({ success: false, message: "El usuario ya existe" }, 400);
  }

  // Hash password using Bun's native password hashing
  const hashedPassword = await Bun.password.hash(data.password);

  // Create user
  try {
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    console.log("User registered:", newUser);

    const response: ApiResponse = {
      message: "Usuario registrado exitosamente",
      success: true,
    };

    return c.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ success: false, message: "Error al crear usuario" }, 500);
  }
})

// Custom login endpoint — bypasses Auth.js CSRF issues in cross-origin dev setup
.post("/api/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ success: false, message: "Email y contraseña requeridos" }, 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return c.json({ success: false, message: "Credenciales inválidas" }, 401);
  }

  // Verify password
  const isValid = await Bun.password.verify(password, user.password);
  if (!isValid) {
    return c.json({ success: false, message: "Credenciales inválidas" }, 401);
  }

  // Create JWT token using Auth.js encode
  const { encode } = await import("@auth/core/jwt");
  const secret = process.env.AUTH_SECRET!;
  
  const token = await encode({
    token: {
      sub: user.id,
      name: user.name,
      email: user.email,
      picture: user.image,
    },
    secret,
    salt: "authjs.session-token",
  });

  // Set the session cookie
  c.header("Set-Cookie", `authjs.session-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`);

  return c.json({
    success: true,
    message: "Login exitoso",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
  });
})

// Custom logout endpoint
.post("/api/logout", (c) => {
  // Clear the session cookie
  c.header("Set-Cookie", "authjs.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  return c.json({ success: true });
})

// Helper: get user from session cookie
// Profile endpoints
.get("/api/profile", async (c) => {
  const { decode } = await import("@auth/core/jwt");
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/authjs\.session-token=([^;]+)/);
  if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

  const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
  if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

  const user = await prisma.user.findUnique({ where: { id: token.sub }, select: { id: true, name: true, email: true, phone: true, image: true, role: true } });
  if (!user) return c.json({ success: false, message: "Usuario no encontrado" }, 404);

  return c.json({ success: true, user });
})

.put("/api/profile", async (c) => {
  const { decode } = await import("@auth/core/jwt");
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/authjs\.session-token=([^;]+)/);
  if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

  const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
  if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

  const body = await c.req.json();
  const { name, email, phone } = body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: token.sub },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
      },
      select: { id: true, name: true, email: true, phone: true, image: true, role: true },
    });

    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return c.json({ success: false, message: "Error al actualizar perfil" }, 500);
  }
})

.post("/api/profile/upload-avatar", async (c) => {
  const { decode } = await import("@auth/core/jwt");
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/authjs\.session-token=([^;]+)/);
  if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

  const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
  if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

  // Parse cloudinary URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  const cloudinaryUrl = process.env.CLOUDINARY_URL || "";
  const cloudMatch = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
  if (!cloudMatch) return c.json({ success: false, message: "Cloudinary no configurado" }, 500);

  const [, apiKey, apiSecret, cloudName] = cloudMatch;

  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  if (!file) return c.json({ success: false, message: "No se envió archivo" }, 400);

  // Upload to Cloudinary
  const uploadData = new FormData();
  uploadData.append("file", file as any);
  uploadData.append("upload_preset", "ml_default");
  uploadData.append("api_key", apiKey as string);
  uploadData.append("folder", "mindora/avatars");

  // Generate signature for signed upload
  const timestamp = Math.floor(Date.now() / 1000).toString();
  uploadData.append("timestamp", timestamp);
  
  // Create signature
  const signString = `folder=mindora/avatars&timestamp=${timestamp}${apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signString);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  uploadData.append("signature", signature);

  try {
    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadData,
    });

    const cloudResData = await cloudRes.json() as { secure_url?: string; error?: { message: string } };

    if (!cloudRes.ok || !cloudResData.secure_url) {
      console.error("Cloudinary error:", cloudResData);
      return c.json({ success: false, message: "Error subiendo imagen" }, 500);
    }

    // Update user image in DB
    await prisma.user.update({
      where: { id: token.sub },
      data: { image: cloudResData.secure_url },
    });

    return c.json({ success: true, url: cloudResData.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ success: false, message: "Error subiendo imagen" }, 500);
  }
})

.put("/api/profile/password", async (c) => {
  const { decode } = await import("@auth/core/jwt");
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/authjs\.session-token=([^;]+)/);
  if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

  const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
  if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

  const body = await c.req.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return c.json({ success: false, message: "Contraseñas requeridas" }, 400);
  }

  if (newPassword.length < 8) {
    return c.json({ success: false, message: "La nueva contraseña debe tener al menos 8 caracteres" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { id: token.sub } });
  if (!user || !user.password) {
    return c.json({ success: false, message: "Usuario no encontrado" }, 404);
  }

  const isValid = await Bun.password.verify(currentPassword, user.password);
  if (!isValid) {
    return c.json({ success: false, message: "Contraseña actual incorrecta" }, 401);
  }

  const hashedPassword = await Bun.password.hash(newPassword);
  await prisma.user.update({
    where: { id: token.sub },
    data: { password: hashedPassword },
  });

  return c.json({ success: true, message: "Contraseña actualizada" });
});

export default app;