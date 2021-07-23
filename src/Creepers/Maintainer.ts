import Creeper from "../Creeper"

export default class Maintainer extends Creeper {
  run(): void {
    let self = this
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      // Withdraw energy from largest container
      case 'filling': {
        if (!creepMemory.target) {
          let resources: any[] = creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })
          resources = resources.concat(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } }))
          resources = resources.concat(creep.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY } }))
          let target:any = _.sortBy(resources, (resource:any) => resource instanceof Resource ? -resource.amount : -resource.store[RESOURCE_ENERGY])[0]
          if (target) { creepMemory.target = target.id }
        }

        let target:any = Game.getObjectById(creepMemory.target); if (target == null) { creepMemory.target = undefined }
        if ((target instanceof StructureContainer) || (target instanceof StructureStorage)) {
          let result = creep.withdraw(target, RESOURCE_ENERGY)
          if (result == ERR_NOT_IN_RANGE)         { self.moveTo(target.pos) }
          if (result == ERR_NOT_ENOUGH_RESOURCES) { 
            if ( creepMemory.stucktimer <= 30 || !creepMemory.stucktimer) { 
              if (creepMemory.stucktimer) { 
                creepMemory.stucktimer += 1
              } else {creepMemory.stucktimer = 1}
            } else {
              let result = PathFinder.search(creep.pos, target.pos, { flee: true })
              self.moveTo(result.path[0])
              delete creepMemory['stucktimer']
              creepMemory.target = undefined
            }  
          }
          if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creepMemory.task = 'repairing'
            creepMemory.target = undefined
          }
        } else {
          if (creep.pickup(target) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creepMemory.task = 'repairing'
            creepMemory.target = undefined
          }
        }
        break
      }

      // Repair structures by largest difference in hp. Will definitely need more intelligent filtering.
      case 'repairing': {
        if (!creepMemory.target) {
          let targets:any = _.sortBy(creep.room.find(FIND_STRUCTURES, { filter: s => (s.structureType == STRUCTURE_ROAD || s.structureType == STRUCTURE_CONTAINER) && s.hits < s.hitsMax }), s => s.hits / s.hitsMax)
          if (targets.length > 0) { creepMemory.target = targets[0].id }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.repair(target) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (target.hits == target.hitsMax) { creepMemory.target = undefined }
          if (creep.store[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'filling'
            creepMemory.target = undefined
          }
        } else {
          creepMemory.target = undefined
          const spawns = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })
          self.moveTo(spawns[0].pos)
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
