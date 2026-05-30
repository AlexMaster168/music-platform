import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

export enum FileType {
   AUDIO = 'audio',
   IMAGE = 'image',
}

@Injectable()
export class FileService {
   private readonly logger = new Logger(FileService.name);
   private readonly staticRoot = path.resolve(__dirname, '..', 'static');

   createFile(type: FileType, file: { originalname: string; buffer: Buffer }): string {
      try {
         const fileExtension = file.originalname.split('.').pop();
         const fileName = `${randomUUID()}.${fileExtension}`;
         const dirPath = path.resolve(this.staticRoot, type);
         if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
         }
         fs.writeFileSync(path.resolve(dirPath, fileName), file.buffer);
         return `${type}/${fileName}`;
      } catch (e) {
         throw new HttpException((e as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   /** Удаляет файл по относительному пути вида "audio/uuid.mp3". Безопасно игнорирует отсутствие. */
   removeFile(relativePath?: string): void {
      if (!relativePath) return;
      try {
         const absolutePath = path.resolve(this.staticRoot, relativePath);
         // защита от выхода за пределы static/
         if (!absolutePath.startsWith(this.staticRoot)) return;
         if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
         }
      } catch (e) {
         this.logger.warn(`Не удалось удалить файл ${relativePath}: ${(e as Error).message}`);
      }
   }
}
