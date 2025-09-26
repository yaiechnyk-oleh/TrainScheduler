import { TimesOrder } from './times-order.validator'

describe('TimesOrder validator', () => {
    const v = new TimesOrder()

    it('accepts when arriveAt > departAt', () => {
        const args = { object: { departAt: '2025-09-24T08:00:00.000Z' } } as any
        expect(v.validate('2025-09-24T09:00:00.000Z', args)).toBe(true)
    })

    it('rejects when arriveAt <= departAt', () => {
        const args1 = { object: { departAt: '2025-09-24T08:00:00.000Z' } } as any
        expect(v.validate('2025-09-24T08:00:00.000Z', args1)).toBe(false)

        const args2 = { object: { departAt: '2025-09-24T08:00:00.000Z' } } as any
        expect(v.validate('2025-09-24T07:59:59.000Z', args2)).toBe(false)
    })

    it('returns true when fields missing (other validators handle required/format)', () => {
        const args = { object: {} } as any
        expect(v.validate(undefined as any, args)).toBe(true)
    })
})
