import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, userId: string) {
    const company = this.companyRepository.create({
      ...createCompanyDto,
      userId,
    });
    return this.companyRepository.save(company);
  }

  async findAll(userId: string) {
    return this.companyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const company = await this.companyRepository.findOne({
      where: { id, userId },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, userId: string) {
    const company = await this.findOne(id, userId);
    Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(company);
  }

  async remove(id: string, userId: string) {
    const company = await this.findOne(id, userId);
    await this.companyRepository.remove(company);
    return { message: 'Company deleted successfully' };
  }
}

