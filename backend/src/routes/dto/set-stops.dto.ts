import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsInt, IsString, Min, ValidateNested, Validate } from 'class-validator'
import { Type } from 'class-transformer'
import { UniqueBy } from '../../common/validators/unique-by.validator'

class StopOrder {
    @ApiProperty({ example: 'uuid-stop-1' })
    @IsString() stopId: string

    @ApiProperty({ example: 1 })
    @IsInt() @Min(1) order: number
}

export class SetStopsDto {
    @ApiProperty({
        type: [StopOrder],
        example: [
            { stopId: 'uuid-stop-kyiv', order: 1 },
            { stopId: 'uuid-stop-fastiv', order: 2 },
            { stopId: 'uuid-stop-lviv', order: 3 },
        ],
    })
    @IsArray() @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => StopOrder)
    @Validate(UniqueBy, ['stopId'], { message: 'stopId values must be unique' })
    @Validate(UniqueBy, ['order'], { message: 'order values must be unique' })
    stops: StopOrder[]
}
