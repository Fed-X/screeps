import Creeper from "../Creeper"

export default class Upgrader extends Creeper {
  run(): void {
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      case 'harvesting': {
        let target:any = Game.getObjectById(creepMemory.source)
        if (creep.harvest(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
        if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
          creepMemory.task = 'upgrading'
        }
        break
      }
      case 'upgrading': {
        let target:any = creep.room.controller
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
        if (creep.carry[RESOURCE_ENERGY] == 0) {
          creepMemory.task = 'harvesting'
        }
        break
      }
    }
  }
}
