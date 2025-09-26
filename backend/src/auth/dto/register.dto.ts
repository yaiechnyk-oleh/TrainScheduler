import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterDto {
    @ApiProperty({ example: 'newuser@example.com' })
    @IsEmail() email: string

    @ApiProperty({ example: 'User123!' })
    @IsString() @MinLength(6) password: string
}
