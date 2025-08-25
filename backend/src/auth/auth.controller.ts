import { Controller, Post, Body, Get, UseGuards, Request } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { JwtAuthGuard } from "./jwt-auth.guard"
import { GetNonceDto, VerifySignatureDto } from "./dto/auth.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('auth')
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('nonce')
  @ApiOperation({ summary: 'Get authentication nonce for a wallet address' })
  @ApiResponse({ status: 201, description: 'Nonce generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid wallet address' })
  async getNonce(@Body() getNonceDto: GetNonceDto) {
    return this.authService.generateNonce(getNonceDto.address);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify wallet signature and get JWT token' })
  @ApiResponse({ status: 201, description: 'Signature verified, JWT token returned' })
  @ApiResponse({ status: 400, description: 'Invalid signature or nonce' })
  async verifySignature(@Body() verifySignatureDto: VerifySignatureDto) {
    return this.authService.verifySignature(verifySignatureDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user;
  }
}
