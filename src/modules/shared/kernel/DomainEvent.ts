const randomUUID = () => crypto.randomUUID()

export abstract class DomainEvent {
  readonly eventId: string
  readonly occurredAt: Date
  abstract readonly eventName: string

  constructor() {
    this.eventId = randomUUID()
    this.occurredAt = new Date()
  }
}
