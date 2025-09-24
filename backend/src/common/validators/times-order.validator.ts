import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator'

@ValidatorConstraint({ name: 'TimesOrder', async: false })
export class TimesOrder implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const obj = args.object as any
        const departAt = obj?.departAt ? new Date(obj.departAt) : undefined
        const arriveAt = value ? new Date(value) : undefined
        if (!departAt || !arriveAt || isNaN(+departAt) || isNaN(+arriveAt)) return true // other validators will handle required/ISO
        return arriveAt > departAt
    }
    defaultMessage() { return 'arriveAt must be after departAt' }
}
