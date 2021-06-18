import ScreepObject from "ScreepObject"

export default class Spawn extends ScreepObject {
  private spawn: StructureSpawn

  constructor(memory: any, spawn: StructureSpawn) {
    super(memory)
    this.spawn = spawn
  }

  createCreep(): void {
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)

    if (this.spawn.room.energyAvailable >= 250) {
      let sources = this.spawn.room.find(FIND_SOURCES)
      let harvesters = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'harvester' })
      let transporters = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'transporter' })
      let constructors = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'constructor' })
      let repairers = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'repairer' })
      let upgraders = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'upgrader' })
      if (harvesters.length < sources.length) {
        this.spawnHarvester()
      } else if (transporters.length < 1) {
        this.spawnTransporter()
      } else if (constructors.length < sources.length) {
        this.spawnConstructor()
      } else if (repairers.length < 1) {
        this.spawnRepairer()
      } else if (upgraders.length < sources.length) {
        this.spawnUpgrader()
      }
    }
  }

  spawnCreep(body: BodyPartConstant[], attrs: any): void {
    let memory = this.memory
    let name = attrs.role + '-' + Game.time.toString()
    this.spawn.spawnCreep(body, name, { memory: attrs })
  }

  spawnHarvester(): void {
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)
    let transporters = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'transporter' })
    let body:any = []
    if (this.spawn.room.energyAvailable >= 250 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 350 : this.spawn.room.energyCapacityAvailable < 350)) {
      body = [MOVE, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 350 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 450 : this.spawn.room.energyCapacityAvailable < 450)) {
      body = [MOVE, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 450 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 550 : this.spawn.room.energyCapacityAvailable < 550)) {
      body = [MOVE, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 550) {
      body = [MOVE, WORK, WORK, WORK, WORK, WORK]
    }
    if (body.length > 0) {
      let memory = this.memory
      let sources = this.spawn.room.find(FIND_SOURCES)
      let harvester_sources:any = _.reject(sources, function(s) { return _.filter(creeps, function(c){ return memory['creeps'][c.name].role == 'harvester' && memory['creeps'][c.name]['source'] == s.id }).length > 0 })
      let harvester_source:any = _.sample(harvester_sources)
      let attrs = { role: 'harvester', task: 'harvesting', source: harvester_source.id }
      this.spawnCreep(body, attrs)
    }
  }

  spawnTransporter(): void {
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)
    let transporters = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'transporter' })
    let body:any = []
    if (this.spawn.room.energyAvailable >= 300 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 350 : this.spawn.room.energyCapacityAvailable < 350)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
    } else if (this.spawn.room.energyAvailable >= 400 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 450 : this.spawn.room.energyCapacityAvailable < 450)) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
    } else if (this.spawn.room.energyAvailable >= 500) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY]
    }
    if (body.length > 0) {
      let attrs = { role: 'transporter', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  spawnConstructor(): void {
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)
    let transporters = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'transporter' })
    let body:any = []
    if (this.spawn.room.energyAvailable >= 300 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 350 : this.spawn.room.energyCapacityAvailable < 350)) {
      body = [MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 350 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 400 : this.spawn.room.energyCapacityAvailable < 400)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 400 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 450 : this.spawn.room.energyCapacityAvailable < 450)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 450 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 500 : this.spawn.room.energyCapacityAvailable < 500)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 500 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 550 : this.spawn.room.energyCapacityAvailable < 550)) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 550) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK]
    }
    if (body.length > 0) {
      let attrs = { role: 'constructor', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  spawnRepairer(): void {
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)
    let transporters = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'transporter' })
    let body:any = []
    if (this.spawn.room.energyAvailable >= 300 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 350 : this.spawn.room.energyCapacityAvailable < 350)) {
      body = [MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 350 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 400 : this.spawn.room.energyCapacityAvailable < 400)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 400 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 450 : this.spawn.room.energyCapacityAvailable < 450)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 450 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 500 : this.spawn.room.energyCapacityAvailable < 500)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 500 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 550 : this.spawn.room.energyCapacityAvailable < 550)) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 550) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK]
    }
    if (body.length > 0) {
      let attrs = { role: 'repairer', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  spawnUpgrader(): void {
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)
    let transporters = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'transporter' })
    let body:any = []
    if (this.spawn.room.energyAvailable >= 300 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 350 : this.spawn.room.energyCapacityAvailable < 350)) {
      body = [MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 350 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 400 : this.spawn.room.energyCapacityAvailable < 400)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 400 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 450 : this.spawn.room.energyCapacityAvailable < 450)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK]
    } else if (this.spawn.room.energyAvailable >= 450 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 500 : this.spawn.room.energyCapacityAvailable < 500)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 500 && (transporters.length == 0 ? this.spawn.room.energyAvailable < 550 : this.spawn.room.energyCapacityAvailable < 550)) {
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
