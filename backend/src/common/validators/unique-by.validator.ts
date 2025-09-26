import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator'

@ValidatorConstraint({ name: 'UniqueBy', async: false })
export class UniqueBy implements ValidatorConstraintInterface {
    validate(arr: any[], args: ValidationArguments) {
        if (!Array.isArray(arr)) return false
        const key = (args.constraints?.[0] as string) || ''
        const seen = new Set()
        for (const item of arr) {
            const val = item?.[key]
            if (seen.has(val)) return false
            seen.add(val)
        }
        return true
    }
    defaultMessage(args: ValidationArguments) {
        const key = (args.constraints?.[0] as string) || 'value'
        return `${key} values must be unique`
    }
}
