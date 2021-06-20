import Creeper from "../Creeper"

export default class Upgrader extends Creeper {
  run(): void {
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      // Withdraw energy from largest container
      case 'filling': {
        if (!creepMemory.target) {
          let resources: any[] = creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })
          resources = resources.concat(creep.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY } }))
          console.log(_.sortBy(resources, (resource:any) => resource instanceof Resource ? -resource.amount : -resource.store[RESOURCE_ENERGY]))
          let target:any = _.sortBy(resources, (resource:any) => resource instanceof Resource ? -resource.amount : -resource.store[RESOURCE_ENERGY])[0]
          if (target) { creepMemory.target = target.id }
        }

        let target:any = Game.getObjectById(creepMemory.target); if (target == null) { creepMemory.target = undefined }
        if (target instanceof StructureContainer) {
          let result = creep.withdraw(target, RESOURCE_ENERGY)
          if (result == ERR_NOT_IN_RANGE)         { creep.moveTo(target) }
          if (result == ERR_NOT_ENOUGH_RESOURCES) { creepMemory.target = undefined }
          if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
            creepMemory.task = 'upgrading'
            creepMemory.target = undefined
          }
        } else {
          if (creep.pickup(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
          if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
            creepMemory.task = 'upgrading'
            creepMemory.target = undefined
          }
        }
        break
      }

      // Upgrade room controller
      case 'upgrading': {
        let target:any = creep.room.controller
        if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
        if (creep.carry[RESOURCE_ENERGY] == 0) {
          creepMemory.task = 'filling'
        }
        break
      }

      default: {
        creepMemory.task = 'filling'
        creepMemory.target = undefined
      }
    }
  }
}
