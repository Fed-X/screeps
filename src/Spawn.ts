import ScreepObject from "ScreepObject"

export default class Spawn extends ScreepObject {
  private spawn: StructureSpawn

  constructor(memory: any, spawn: StructureSpawn) {
    super(memory)
    this.spawn = spawn
  }

  // Spawn new creep if applicable
  // Needs further testing and balancing
  createCreep(): void {
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)

    if (this.spawn.room.energyAvailable >= 250) {
      let sources = this.spawn.room.find(FIND_SOURCES)
      let harvesters = _.filter(creeps, function(c) { return memory['creeps'][c.name]?.role == 'harvester' })
      let transporters = _.filter(creeps, function(c) { return memory['creeps'][c.name]?.role == 'transporter' })
      let constructors = _.filter(creeps, function(c) { return memory['creeps'][c.name]?.role == 'constructor' })
      let repairers = _.filter(creeps, function(c) { return memory['creeps'][c.name]?.role == 'repairer' })
      let upgraders = _.filter(creeps, function(c) { return memory['creeps'][c.name]?.role == 'upgrader' })
      let transportAvailable = harvesters.length > 0 && transporters.length > 0 // If there is higher energy capacity available, use this to wait for the transporters.

      if (harvesters.length < sources.length) {             // One stationary harvester per source
        this.spawnHarvester(transportAvailable)
      } else if (transporters.length < 1) {                 // Single transporter for now
        this.spawnTransporter(transportAvailable)
      } else if (constructors.length < sources.length) {    // One constructor per source.. needs balancing
        this.spawnConstructor(transportAvailable)
      } else if (repairers.length < 1) {                    // Single repairer for now
        this.spawnRepairer(transportAvailable)
      } else if (upgraders.length < sources.length) {       // One upgrader per source.. needs balancing
        this.spawnUpgrader(transportAvailable)
      }
    }
  }

  spawnCreep(body: BodyPartConstant[], attrs: any): void {
    let memory = this.memory
    let name = attrs.role + '-' + Game.time.toString()
    if (this.spawn.spawnCreep(body, name) == OK) {
      memory['creeps'][name] = attrs
    }
  }

  // Harvester: Built for stationary drop-mining
  spawnHarvester(transportAvailable: boolean): void {
    let body:any = []
    if (this.spawn.room.energyAvailable >= 250 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 350 : this.spawn.room.energyAvailable < 350)) {
      body = [MOVE, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 350 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 450 : this.spawn.room.energyAvailable < 450)) {
      body = [MOVE, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 450 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 550 : this.spawn.room.energyAvailable < 550)) {
      body = [MOVE, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 550) {
      body = [MOVE, WORK, WORK, WORK, WORK, WORK]
    }
    if (body.length > 0) {
      let memory = this.memory
      let creeps = this.spawn.room.find(FIND_MY_CREEPS)
      let sources = this.spawn.room.find(FIND_SOURCES)
      // Find unassigned energy source
      let harvester_sources:any = _.reject(sources, function(s) { return _.filter(creeps, function(c){ return memory['creeps'][c.name]?.role == 'harvester' && memory['creeps'][c.name]['source'] == s.id }).length > 0 })
      let harvester_source:any = _.sample(harvester_sources)
      let attrs = { role: 'harvester', task: 'harvesting', source: harvester_source.id }
      this.spawnCreep(body, attrs)
    }
  }

  // Transporter: Responsible for refilling energy (extensions, towers, storage, etc.)
  spawnTransporter(transportAvailable: boolean): void {
    let body:any = []
    if (this.spawn.room.energyAvailable >= 300 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 350 : this.spawn.room.energyAvailable < 350)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
    } else if (this.spawn.room.energyAvailable >= 400 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 450 : this.spawn.room.energyAvailable < 450)) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
    } else if (this.spawn.room.energyAvailable >= 500) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY]
    }
    if (body.length > 0) {
      let attrs = { role: 'transporter', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  // Constructor: Transports energy to build sites, converts into upgrader if none available.
  spawnConstructor(transportAvailable: boolean): void {
    let body:any = []
    if (this.spawn.room.energyAvailable >= 300 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 350 : this.spawn.room.energyAvailable < 350)) {
      body = [MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 350 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 400 : this.spawn.room.energyAvailable < 400)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 400 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 450 : this.spawn.room.energyAvailable < 450)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 450 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 500 : this.spawn.room.energyAvailable < 500)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 500 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 550 : this.spawn.room.energyAvailable < 550)) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 550) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK]
    }
    if (body.length > 0) {
      let attrs = { role: 'constructor', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  // Repairer: Responsible for structures that require upkeep
  spawnRepairer(transportAvailable: boolean): void {
    let body:any = []
    if (this.spawn.room.energyAvailable >= 300 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 350 : this.spawn.room.energyAvailable < 350)) {
      body = [MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 350 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 400 : this.spawn.room.energyAvailable < 400)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 400 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 450 : this.spawn.room.energyAvailable < 450)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 450 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 500 : this.spawn.room.energyAvailable < 500)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 500 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 550 : this.spawn.room.energyAvailable < 550)) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 550) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK]
    }
    if (body.length > 0) {
      let attrs = { role: 'repairer', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  // Upgrader: Transports energy to the room controller
  spawnUpgrader(transportAvailable: boolean): void {
    let body:any = []
    if (this.spawn.room.energyAvailable >= 300 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 350 : this.spawn.room.energyAvailable < 350)) {
      body = [MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 350 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 400 : this.spawn.room.energyAvailable < 400)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 400 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 450 : this.spawn.room.energyAvailable < 450)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 450 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 500 : this.spawn.room.energyAvailable < 500)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 500 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 550 : this.spawn.room.energyAvailable < 550)) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 550) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK]
    }
    if (body.length > 0) {
      let attrs = { role: 'upgrader', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }
}
