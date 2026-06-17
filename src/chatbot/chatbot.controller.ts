import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { AskChatbotDto } from './dto/ask-chatbot.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Hacer una pregunta al chatbot de BoletoClick' })
  @ApiBody({ type: AskChatbotDto })
  ask(@Body() askChatbotDto: AskChatbotDto) {
    return this.chatbotService.ask(askChatbotDto.message);
  }
}
