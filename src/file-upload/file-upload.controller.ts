import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersInterceptor } from '../interceptors/user.interceptor';

@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Put('uploadImage/:id')
  //#region API DOCUMENTATION
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cargar una imagen para un usuario' })
  @ApiParam({
    name: 'id',
    description: 'Id del usuario que se desea actualizar',
    type: 'string',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Imagen en format .jpg,.png,.gif,.webp,.jpeg. No mayor a 1MB',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'La imagen fue cargada correctamente',
  })
  @ApiResponse({
    status: 400,
    description:
      'No cumple con los parametros de tamaño o formato. Id no es en formato UUID',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe el usuario con el ID indicado',
  })
  //#endregion
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(UsersInterceptor)
  async uploadImage(
    @Param('id', ParseUUIDPipe) userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024, // 1MB
            errorMessage: 'Supera el peso maximo',
          }),
          new FileTypeValidator({
            fileType: /(.jpg|.png|.gif|.webp|.jpeg)/,
            errorMessage: 'Extensión del archivo no es valida',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileUploadService.uploadImage(userId, file);
  }
}
