import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "ADMIN" | "SELLER" | "USER";
    };
  }
  interface User {
    id: string;
    role: "ADMIN" | "SELLER" | "USER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "SELLER" | "USER";
  }
}
