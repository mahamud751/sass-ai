import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI Assistant')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to LifeMate AI' })
  chat(@CurrentUser() user: any, @Body() dto: ChatDto) {
    return this.aiService.chat(user.id, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get AI chat sessions' })
  getSessions(@CurrentUser() user: any) {
    return this.aiService.getSessions(user.id);
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Get messages in a session' })
  getMessages(@CurrentUser() user: any, @Param('id') id: string) {
    return this.aiService.getMessages(user.id, id);
  }
}
