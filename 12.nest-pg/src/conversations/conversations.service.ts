import 'dotenv/config';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { OllamaEmbeddings } from '@langchain/ollama';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.entiry';
import { Conversation } from './entities/conversation.entity';
// import { CreateConversationDto } from './dto/create-conversation.dto';
// import { UpdateConversationDto } from './dto/update-conversation.dto';

export interface SemanticSearchResult {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  created_at: Date;
  similarity: number;
}

@Injectable()
export class ConversationsService {
  private embeddings: OllamaEmbeddings | null = null;

  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  /** 用户 → 会话（一对多） */
  async findConversationsByUserId(userId: number) {
    const user = await this.em.findOne(User, {
      where: { id: userId },
      relations: { conversations: true }, // 关联查询
      order: { conversations: { createdAt: 'DESC' } },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return user;
  }

  /** 会话 → 消息（一对多） */
  async findMessagesByConversationId(conversationId: number) {
    const conversation = await this.em.findOne(Conversation, {
      where: { id: conversationId },
      relations: { messages: true },
      order: { messages: { createdAt: 'ASC' } },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation #${conversationId} not found`);
    }

    return {
      id: conversation.id,
      userId: conversation.userId,
      title: conversation.title,
      createdAt: conversation.createdAt,
      messages: conversation.messages,
    };
  }

  /** 会话内语义检索（pgvector 余弦距离） */
  async searchSimilarMessages(
    conversationId: number,
    searchText: string,
    limit = 5,
  ): Promise<SemanticSearchResult[]> {
    const conversation = await this.em.findOne(Conversation, {
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation #${conversationId} not found`);
    }

    const vector = await this.embeddings?.embedQuery(searchText);

    // 向量检索是扩展的 sql 语法，所以得用 sql 写查询
    const rows: SemanticSearchResult[] = await this.em.query(
      `SELECT id, conversation_id, role, content, created_at,
              1 - (embedding <=> $1::vector) AS similarity
       FROM messages
       WHERE conversation_id = $2 AND embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [JSON.stringify(vector), conversationId, limit],
    );

    return rows.map((r) => ({ ...r, similarity: Number(r.similarity) }));
  }
}
