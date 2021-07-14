import Creeper from "../Creeper"

export default class Constructor extends Creeper {
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
              let result = Pathfinder.search(creep.pos, target.pos, { flee: true })
              self.moveTo(result.path[0])
              delete creepMemory['stucktimer']
              creepMemory.target = undefined
            }  
          }  
          if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creepMemory.task = 'constructing'
            creepMemory.target = undefined
          }
        } else {
          if (creep.pickup(target) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creepMemory.task = 'constructing'
            creepMemory.target = undefined
          }
        }
        break
      }

      // Transport energy to build sites by largest first. Convert into upgrader if none available.
      case 'constructing': {
        let ramparts = creep.room.find(FIND_MY_STRUCTURES, { filter: (s:any) => s.structureType == STRUCTURE_RAMPART && s.hits == 1 })
        if (ramparts.length > 0 && !Game.getObjectById(creepMemory.target)) {
          creepMemory.task = 'repairing'
          creepMemory.target = ramparts[0].id
        }
        if (!creepMemory.target || !Game.getObjectById(creepMemory.target)) {
          let targets:any = _.sortBy(creep.room.find(FIND_MY_CONSTRUCTION_SITES), function(s:any){ return s.progressTotal })
          if (targets.length > 0) { creepMemory.target = targets[0].id }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.pos.inRangeTo(target.pos, 3)) {
            creep.build(target)
          } else {
            self.moveTo(target.pos)
          }
          if (creep.store[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'filling'
            creepMemory.target = undefined
          }
        } else {
          creepMemory.task = 'upgrading'
          creepMemory.target = undefined
        }
        break
      }

      // Upgrade room controller
      case 'upgrading': {
        let target:any = creep.room.controller
        if (creep.pos.inRangeTo(target, 3)) {
            creep.upgradeController(target)
        } else {
          self.moveTo(target.pos)
        }
        if (creep.store[RESOURCE_ENERGY] == 0) {
          creepMemory.task = 'filling'
        }
        break
      }

      // Initialize ramparts
      case 'repairing': {
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.repair(target) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (creep.store[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'filling'
            creepMemory.target = undefined
          }
        } else {
          creepMemory.task = 'filling'
          creepMemory.target = undefined
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
