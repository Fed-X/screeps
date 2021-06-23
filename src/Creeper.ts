import ScreepObject from "ScreepObject"

export default class Creeper extends ScreepObject {
  protected creep: Creep

  constructor(memory: any, creep: Creep) {
    super(memory)
    this.creep = creep
  }

  moveTo(target: RoomPosition): void {
    this.creep.moveTo(target, {ignoreCreeps:true})
  }
}
