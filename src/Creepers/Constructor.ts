import Creeper from "../Creeper"

export default class Constructor extends Creeper {
  run(): void {
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      case 'harvesting': {
        let target:any = Game.getObjectById(creepMemory.source)
        if (creep.harvest(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
        if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
          creepMemory.task = 'constructing'
        }
        break
      }
      case 'constructing': {
        if (!creepMemory.target) {
          let targets:any = _.sortBy(creep.room.find(FIND_MY_CONSTRUCTION_SITES), function(s:any){ return -s.progressTotal })
          if (targets.length > 0) { creepMemory.target = targets[0].id }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.build(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
          if (creep.carry[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'harvesting'
            creepMemory.target = undefined
          }
        } else {
          creepMemory.role = 'upgrader'
          creepMemory.task = 'harvesting'
          creepMemory.target = undefined
        }
        break
      }
    }
  }
}
