import { ArrayNotEmpty, IsArray, IsInt, IsString, Min, ValidateNested, Validate } from 'class-validator'
import { Type } from 'class-transformer'
import { UniqueBy } from '../../common/validators/unique-by.validator'

class StopOrder {
    @IsString() stopId: string
    @IsInt() @Min(1) order: number
}

export class SetStopsDto {
    @IsArray() @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => StopOrder)
    @Validate(UniqueBy, ['stopId'], { message: 'stopId values must be unique' })
    @Validate(UniqueBy, ['order'], { message: 'order values must be unique' })
    stops: StopOrder[]
}
