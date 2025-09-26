import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateRouteDto {
    @ApiProperty({ example: 'Kyiv → Lviv (fast line)' })
    @IsString() name: string

    @ApiPropertyOptional({ example: 'IC-721' })
    @IsOptional() @IsString() code?: string
}
