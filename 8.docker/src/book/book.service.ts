import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { EntityManager } from 'typeorm';
import { Book } from './entities/book.entity';

@Injectable()
export class BookService {
  @Inject(EntityManager)
  private readonly entityManager: EntityManager;

  create(createBookDto: CreateBookDto) {
    const book = this.entityManager.create(Book, {
      ...createBookDto,
      publishedDate: new Date(createBookDto.publishedDate),
    });

    return this.entityManager.save(book);
  }

  findAll() {
    return this.entityManager.find(Book, {
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const book = await this.entityManager.findOneBy(Book, { id });
    if (!book) {
      throw new NotFoundException(`Book #${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const book = await this.findOne(id);
    const { publishedDate, ...restPayload } = updateBookDto;
    const updatePayload: Partial<Book> = { ...restPayload };

    if (publishedDate !== undefined) {
      updatePayload.publishedDate = new Date(publishedDate);
    }

    const mergedBook = this.entityManager.merge(Book, book, updatePayload);
    return this.entityManager.save(Book, mergedBook);
  }

  async remove(id: number) {
    const book = await this.findOne(id);
    await this.entityManager.remove(Book, book);
    return { deleted: true };
  }
}
