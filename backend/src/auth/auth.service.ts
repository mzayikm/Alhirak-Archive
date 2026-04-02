import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateRawToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('SMTP_FROM');

    if (!host || !port || !user || !pass || !from) {
      return false;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return true;
  }

  async signup(signupDto: SignupDto) {
    const username = signupDto.username.trim().toLowerCase();
    const email = signupDto.email.trim().toLowerCase();
    const password = signupDto.password;

    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new BadRequestException('Username already exists');
      }

      if (existingUser.email === email) {
        throw new BadRequestException('Email already exists');
      }

      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      username,
      email,
      passwordHash,
      role: 'user',
    });

    const payload = {
      sub: user._id?.toString(),
      username: user.username,
      role: user.role,
    };

    return {
      message: 'Account created successfully',
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user._id?.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const loginValue = loginDto.username.trim().toLowerCase();
    const password = loginDto.password;

    const user = await this.userModel.findOne({
      $or: [{ username: loginValue }, { email: loginValue }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id?.toString(),
      username: user.username,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user._id?.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.trim().toLowerCase();

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('No account found with this email');
    }

    const rawResetToken = this.generateRawToken();
    const passwordResetTokenHash = this.hashToken(rawResetToken);
    const passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30);

    user.passwordResetTokenHash = passwordResetTokenHash;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const resetLink = `${frontendUrl}/reset-password?token=${rawResetToken}`;

    const emailSent = await this.sendEmail({
      to: user.email,
      subject: 'Reset your password',
      text: `Reset your password here: ${resetLink}`,
      html: `<p>Reset your password by clicking <a href="${resetLink}">this link</a>.</p>`,
    });

    if (!emailSent) {
      return {
        message:
          'SMTP is not configured. Reset email could not be sent in this environment.',
      };
    }

    return {
      message: 'Reset link sent successfully',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const tokenHash = this.hashToken(resetPasswordDto.token);

    const user = await this.userModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.passwordHash = await bcrypt.hash(resetPasswordDto.password, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return {
      message: 'Password reset successfully',
    };
  }

  async getProfile(user: any) {
    return user;
  }

  async logout() {
    return {
      message: 'Logged out successfully',
    };
  }
}