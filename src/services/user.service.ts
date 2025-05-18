import { User } from "@prisma/client";
import logger from "../config/logger";
import { CreateUserDto, UserIdentifier } from "../types/user.type";
import prisma from "../config/database";

export class UserService {
  async findByIdentifier(identifier: UserIdentifier): Promise<User | null> {
    const { email, phone } = identifier;

    if (!email && !phone) {
      throw new Error("Either email or phone must be provided");
    }

    try {
      const whereClause: any = {};

      if (email) whereClause.email = email;
      if (phone) whereClause.phone = phone;

      const user = await prisma.user.findFirst({
        where: whereClause,
      });

      return user;
    } catch (error) {
      logger.error("Error finding user by identifier", { identifier, error });
      throw error;
    }
  }
  async create(userData: CreateUserDto): Promise<User> {
    try {
      if (!userData.email && !userData.phone) {
        throw new Error("Either email or phone must be provided");
      }

      const user = await prisma.user.create({
        data: userData,
      });

      logger.info("User created", { userId: user.id });
      return user;
    } catch (error) {
      logger.error("Error creating user", { userData, error });
      throw error;
    }
  }
  async findOrCreate(userData: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.findByIdentifier({
        email: userData.email,
        phone: userData.phone,
      });
      if (existingUser) return existingUser;

      return this.create(userData);
    } catch (error) {
      logger.error("Error finding or creating user", { userData, error });
      throw error;
    }
  }
}

export default new UserService();
