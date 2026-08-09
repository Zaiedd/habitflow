import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List habit categories' })
  findAll(@CurrentUser() user: { sub: string }) {
    return this.categories.findAll(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a habit category' })
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateCategoryDto) {
    return this.categories.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categories.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a category' })
  remove(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.categories.remove(user.sub, id);
  }
}
