import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Request,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { readFileSync } from 'fs';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id/update')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(Number(id), updateProductDto);
  }

  @Delete(':id/detele')
  async remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'upload/',
        filename: (req, file, callback) => {
          callback(null, file.originalname);
        },
      }),
    }),
  )
  async uploadFile(
    @Request() req,
    @UploadedFiles() file,
    @Res() res: Response,
  ) {
    if (req.file.mimetype !== 'text/csv') {
      throw new HttpException('Error format file', HttpStatus.BAD_REQUEST);
    }
    try {
      const path = 'upload/' + req.file.originalname;
      const csvFile = readFileSync(path);
      const csvData = csvFile.toString();
      const data = this.convertCSVToArray(csvData);
      await this.productService.saveMultiData(data);
      fs.unlinkSync(path);
      return res.status(HttpStatus.OK).send('Success');
    } catch (error) {
      throw new HttpException(error, HttpStatus.EXPECTATION_FAILED);
    }
  }

  convertCSVToArray = (data) => {
    const listData = [];
    data = data.replaceAll('\r\n', '\n');
    const lineArray = data.split('\n');
    const title = lineArray[0].split(';');
    for (let i = 1; i < lineArray.length; i++) {
      const dataObject = {};
      const value = lineArray[i].split(';');
      for (let y = 0; y < value.length; y++) {
        dataObject[title[y].toLowerCase()] = value[y];
      }
      listData.push(dataObject);
    }
    return listData;
  };
}
