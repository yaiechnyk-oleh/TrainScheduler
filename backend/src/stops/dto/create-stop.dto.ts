import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateStopDto {
    @ApiProperty({ example: 'Kyiv-Pasazhyrskyi' })
    @IsString() name: string

    @ApiPropertyOptional({ example: 'Kyiv' })
    @IsOptional() @IsString() city?: string

    @ApiPropertyOptional({ example: 50.441 })
    @IsOptional() @Type(() => Number) @IsNumber() @Min(-90) @Max(90) lat?: number

    @ApiPropertyOptional({ example: 30.489 })
    @IsOptional() @Type(() => Number) @IsNumber() @Min(-180) @Max(180) lng?: number
}
