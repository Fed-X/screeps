import ScreepObject from "ScreepObject"

export default class Spawn extends ScreepObject {
  private spawn: StructureSpawn

  constructor(memory: any, spawn: StructureSpawn) {
    super(memory)
    this.spawn = spawn
  }

  // Renew nearby creeps
  renewCreeps(): void {
    let memory = this.memory
    let spawn = this.spawn
    let creeps = spawn.room.find(FIND_MY_CREEPS)

    let renewals = _.filter(creeps, c => memory['creeps'][c.name]?.task == 'renewing' && spawn.pos.getRangeTo(c) == 1)
    if (renewals.length > 0) { spawn.renewCreep(renewals[0]) }
  }

  // Spawn new creep if applicable
  // Needs further testing and balancing
  createCreep(): void {
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)

    if (this.spawn.room.energyAvailable >= 250) {
      let sources = this.spawn.room.find(FIND_SOURCES)
      let minerals = _.filter(this.spawn.room.find(FIND_MINERALS), mineral => mineral.mineralAmount > 0 && _.any(mineral.pos.lookFor(LOOK_STRUCTURES), s => s.structureType == STRUCTURE_EXTRACTOR))
      let harvesters = _.filter(creeps, c => memory['creeps'][c.name]?.role == 'harvester' || memory['creeps'][c.name]?.role == 'mineralHarvester')
      let transporters = _.filter(creeps, c => memory['creeps'][c.name]?.role == 'transporter')
      let spawnTransporters = _.filter(creeps, c => memory['creeps'][c.name]?.role == 'spawnTransporter')
      let constructors = _.filter(creeps, c => memory['creeps'][c.name]?.role == 'constructor')
      let maintainers = _.filter(creeps, c => memory['creeps'][c.name]?.role == 'maintainer')
      let repairers = _.filter(creeps, c => memory['creeps'][c.name]?.role == 'repairer')
      let upgraders = _.filter(creeps, c => memory['creeps'][c.name]?.role == 'upgrader')
      let claimers = _.values(_.pick(memory['creeps'], c => c.role == 'claimer'))
      let reservers = _.values(_.pick(memory['creeps'], c => c.role == 'reserver'))
      let unclaimed = _.filter(_.map(Game.flags, flag => flag), flag => flag.color == COLOR_GREEN && flag.secondaryColor == COLOR_GREEN && (!(flag.pos.roomName in Game.rooms) || (flag.room?.controller && !flag.room.controller.my)))
      let unreserved = _.filter(_.map(Game.flags, flag => flag), flag => flag.color == COLOR_GREEN && flag.secondaryColor == COLOR_WHITE)
      let targets = _.filter(_.map(Game.flags, flag => flag), flag => flag.color == COLOR_RED && flag.secondaryColor == COLOR_RED)
      let transportAvailable = harvesters.length > 0 && spawnTransporters.length > 0 // If there is higher energy capacity available, use this to wait for the transporters.

      if (harvesters.length < sources.length + minerals.length) {  // Single harvester per source
        console.log('spawnHarvester')
        this.spawnHarvester(transportAvailable)
      } else if (spawnTransporters.length < 1) {                   // Single spawn / extension transporter
        console.log('spawnTransporters')
        this.spawnExtensionTransporter(transportAvailable)
      } else if (transporters.length < 1) {                        // Single transporter for all other structures
        console.log('transporter')
        this.spawnTransporter(transportAvailable)
      } else if (constructors.length < 1) {                        // Single constructor
        console.log('constructor')
        this.spawnConstructor(transportAvailable)
      } else if (upgraders.length < 3) {                           // Single upgrader
        console.log('upgraders, 3')
        this.spawnUpgrader(transportAvailable)
      } else if (maintainers.length < 1) {                         // Single maintainer
        console.log('maintainer')
        this.spawnMaintainer(transportAvailable)
      } else if (repairers.length < 1) {                           // Single repairer
        console.log('repairer')
        this.spawnRepairer(transportAvailable)
      } else if (targets.length > 0) {                             // Spawn attackers
        console.log('attackers')
        this.spawnAttacker(transportAvailable)
      } else if (claimers.length < unclaimed.length) {             // Single claimer per controller
        console.log('claimers')
        this.spawnClaimer(transportAvailable)
      } else if (reservers.length < unreserved.length) {           // Single reserver per controller
        console.log('reservers')
        this.spawnReserver(transportAvailable)
      }
    }
  }

  spawnCreep(body: BodyPartConstant[], attrs: any): void {
    let memory = this.memory
    let name = attrs.role + '-' + Game.time.toString()
    let result = this.spawn.spawnCreep(body, name)
    console.log(result)
    if (result == OK) {
      memory['creeps'][name] = attrs
    }
  }

  spawnAttacker(transportAvailable: boolean): void {
    let body:any = []
    if (this.spawn.room.energyAvailable >= 1750) {
      body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
    }
    if (body.length > 0) {
      let attrs = { role: 'attacker', task: 'attacking' }
      this.spawnCreep(body, attrs)
    }
  }

  spawnClaimer(transportAvailable: boolean): void {
    let body:any = []
    if (this.spawn.room.energyAvailable >= 850) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, CLAIM]
    }
    if (body.length > 0) {
      let memory = this.memory
      let flags:any = _.filter(_.map(Game.flags, flag => flag), flag => flag.color == COLOR_GREEN && flag.secondaryColor == COLOR_GREEN && (!(flag.pos.roomName in Game.rooms) || (flag.room?.controller && !flag.room.controller.my)))
      flags = _.reject(flags, (f:any) => _.any(_.values(memory['creeps']), (c:any) => c['role'] == 'claimer' && c['target'] == f['name']))
      let flag:any = _.sample(flags)
      let attrs = { role: 'claimer', task: 'claiming', target: flag.name }
      this.spawnCreep(body, attrs)
    }
  }

  spawnReserver(transportAvailable: boolean): void {
    let body:any = []
    if (this.spawn.room.energyAvailable >= 1700) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CLAIM, CLAIM]
    }
    if (body.length > 0) {
      let memory = this.memory
      let flags:any = _.filter(_.map(Game.flags, flag => flag), flag => flag.color == COLOR_GREEN && flag.secondaryColor == COLOR_WHITE)
      flags = _.reject(flags, (f:any) => _.any(_.values(memory['creeps']), (c:any) => c['role'] == 'reserver' && c['target'] == f['name']))
      let flag:any = _.sample(flags)
      let attrs = { role: 'reserver', task: 'reserving', target: flag.name }
      this.spawnCreep(body, attrs)
    }
  }

  // Harvester: Built for stationary drop-mining
  spawnHarvester(transportAvailable: boolean): void {
    let body = this.harvesterBody(transportAvailable)
    if (body.length > 0) {
      let memory = this.memory
      let creeps = this.spawn.room.find(FIND_MY_CREEPS)
      let sources = this.spawn.room.find(FIND_SOURCES)
      let minerals = _.reject(_.filter(this.spawn.room.find(FIND_MINERALS), m => _.any(m.pos.lookFor(LOOK_STRUCTURES), s => s.structureType == STRUCTURE_EXTRACTOR)), m => _.any(creeps, c => memory['creeps'][c.name]?.role == 'mineralHarvester' && memory['creeps'][c.name]['source'] == m.id))
      // Find unassigned energy source
      let harvester_sources:any = _.reject(sources, s => _.any(creeps, c => memory['creeps'][c.name]?.role == 'harvester' && memory['creeps'][c.name]['source'] == s.id))
      let harvester_source:any = _.sample(harvester_sources)
      if (harvester_source == null && minerals.length > 0) {
        let attrs = { role: 'mineralHarvester', task: 'harvesting', source: minerals[0].id, mineral: minerals[0].mineralType }
        this.spawnCreep(body, attrs)
      } else {
        let attrs = { role: 'harvester', task: 'harvesting', source: harvester_source.id }
        this.spawnCreep(body, attrs)
      }
    }
  }

  // SpawnTransporter: Responsible for refilling spawn energy
  spawnExtensionTransporter(transportAvailable: boolean): void {
    let body = this.transportBody(transportAvailable)
    if (body.length > 0) {
      let attrs = { role: 'spawnTransporter', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  // Transporter: Responsible for refilling energy (towers, storage, etc.)
  spawnTransporter(transportAvailable: boolean): void {
    let body = this.transportBody(transportAvailable)
    if (body.length > 0) {
      let attrs = { role: 'transporter', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  // Constructor: Transports energy to build sites, falls back to upgrading if none available.
  spawnConstructor(transportAvailable: boolean): void {
    let body = this.workerBody(transportAvailable)
    if (body.length > 0) {
      let attrs = { role: 'constructor', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  // Maintainer: Responsible for repairing roads and containers
  spawnMaintainer(transportAvailable: boolean): void {
    let body = this.workerBody(transportAvailable)
    if (body.length > 0) {
      let attrs = { role: 'maintainer', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  // Repairer: Responsible for repairing walls and ramparts
  spawnRepairer(transportAvailable: boolean): void {
    let body = this.workerBody(transportAvailable)
    if (body.length > 0) {
      let attrs = { role: 'repairer', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  // Upgrader: Transports energy to the room controller
  spawnUpgrader(transportAvailable: boolean): void {
    let body = this.workerBody(transportAvailable)
    if (body.length > 0) {
      let attrs = { role: 'upgrader', task: 'filling' }
      this.spawnCreep(body, attrs)
    }
  }

  harvesterBody(transportAvailable: boolean): BodyPartConstant[] {
    let body:BodyPartConstant[] = []
    if (this.spawn.room.energyAvailable >= 250 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 350 : this.spawn.room.energyAvailable < 350)) {
      body = [MOVE, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 350 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 450 : this.spawn.room.energyAvailable < 450)) {
      body = [MOVE, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 450 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 550 : this.spawn.room.energyAvailable < 550)) {
      body = [MOVE, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 550 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 600 : this.spawn.room.energyAvailable < 600)) {
      body = [MOVE, WORK, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 600 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 650 : this.spawn.room.energyAvailable < 650)) {
      body = [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 650 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 700 : this.spawn.room.energyAvailable < 700)) {
      body = [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 700 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 750 : this.spawn.room.energyAvailable < 750)) {
      body = [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 750 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 850 : this.spawn.room.energyAvailable < 850)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 850 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 950 : this.spawn.room.energyAvailable < 950)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, WORK, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 950) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK]
    }
    return body
  }

  transportBody(transportAvailable: boolean): BodyPartConstant[] {
    let body:BodyPartConstant[] = []
    if (this.spawn.room.energyAvailable >= 300 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 400 : this.spawn.room.energyAvailable < 400)) {
      body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
    } else if (this.spawn.room.energyAvailable >= 400 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 500 : this.spawn.room.energyAvailable < 500)) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
    } else if (this.spawn.room.energyAvailable >= 500 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 600 : this.spawn.room.energyAvailable < 600)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY]
    } else if (this.spawn.room.energyAvailable >= 600 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 700 : this.spawn.room.energyAvailable < 700)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
    } else if (this.spawn.room.energyAvailable >= 700 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 800 : this.spawn.room.energyAvailable < 800)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
    } else if (this.spawn.room.energyAvailable >= 800 ) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
    }
    return body
  }

  workerBody(transportAvailable: boolean): BodyPartConstant[] {
    let body:BodyPartConstant[] = []
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
    } else if (this.spawn.room.energyAvailable >= 550 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 600 : this.spawn.room.energyAvailable < 600)) {
      body = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 600 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 650 : this.spawn.room.energyAvailable < 650)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 650 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 700 : this.spawn.room.energyAvailable < 700)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 700 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 750 : this.spawn.room.energyAvailable < 750)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 750 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 800 : this.spawn.room.energyAvailable < 800)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 800 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 850 : this.spawn.room.energyAvailable < 850)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 850 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 900 : this.spawn.room.energyAvailable < 900)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 900 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 950 : this.spawn.room.energyAvailable < 950)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 950 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1000 : this.spawn.room.energyAvailable < 1000)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1000 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1050 : this.spawn.room.energyAvailable < 1050)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1050 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1100 : this.spawn.room.energyAvailable < 1100)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1100 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1150 : this.spawn.room.energyAvailable < 1150)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1150 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1200 : this.spawn.room.energyAvailable < 1200)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1200 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1250 : this.spawn.room.energyAvailable < 1250)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1250 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1300 : this.spawn.room.energyAvailable < 1300)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1300 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1350 : this.spawn.room.energyAvailable < 1350)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1350 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1400 : this.spawn.room.energyAvailable < 1400)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1400 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1550 : this.spawn.room.energyAvailable < 1550)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1550 && (transportAvailable ? this.spawn.room.energyCapacityAvailable < 1550 : this.spawn.room.energyAvailable < 1550)) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK]
    } else if (this.spawn.room.energyAvailable >= 1700) {
      body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK]
    }
    return body
  }
}
