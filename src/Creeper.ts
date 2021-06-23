import ScreepObject from "ScreepObject"

export default class Creeper extends ScreepObject {
  protected creep: Creep

  constructor(memory: any, creep: Creep) {
    super(memory)
    this.creep = creep
  }

  moveTo(target: RoomPosition): void {
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    let ignore = true

    if (creepMemory.previous && Game.time - creepMemory.previous.time <= 1 && creep.pos.x == creepMemory.previous.x && creep.pos.y == creepMemory.previous.y) {
      ignore = false
    }
    creepMemory.previous = { time: Game.time, x: creep.pos.x, y: creep.pos.y }

    creep.moveTo(target, {ignoreCreeps:ignore})
  }
}
