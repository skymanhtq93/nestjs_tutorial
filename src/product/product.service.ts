import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return await this.productRepository.save(createProductDto);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepository.findOne(id);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<UpdateResult> {
    return await this.productRepository.update(id, updateProductDto);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.productRepository.delete(id);
  }

  async saveMultiData(data: Array<any>) {
    return await this.productRepository
      .createQueryBuilder()
      .insert()
      .into(Product)
      .values(data)
      .orUpdate({
        conflict_target: ['name', 'color'],
        overwrite: ['name', 'color', 'price'],
      })
      .updateEntity(false)
      .execute();
  }
}
