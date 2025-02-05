class city3 extends Phaser.Scene {

    constructor() {
        super({ key: 'city3' });

        // Put global variable here
        this.showGuard = true;
    }


    init(data) {
        this.player = data.player
        this.inventory = data.inventory
    }

    preload() {
    }

    create() {
        console.log('*** city3/bigcastle ');
        console.log('inventory: ', this.inventory);

        this.pingSnd = this.sound.add('ping');

        let map = this.make.tilemap({ key: 'map3' });

        let groundTiles = map.addTilesetImage('ultima', 'u3');

        let cityfloor = map.createLayer('floorLayer', groundTiles, 0, 0).setScale(2);
        let castleLayer = map.createLayer('cityLayer', groundTiles, 0, 0).setScale(2);

        // Cleric will receive the chest
        this.british = this.physics.add.sprite(315, 150, 'u3')
                .play('british').setScale(4).setImmovable(true);

        this.guardGroup1 = this.physics.add.group({
            key: "u3",
            repeat: 6,
            setXY: { x: 250, y: 200, stepY: 50}
        })

        this.guardGroup2 = this.physics.add.group({
            key: "u3",
            repeat: 6,
            setXY: { x: 380, y: 200, stepY: 50}
        })

        this.guardGroup1.children.iterate( g => g.play('guard').setScale(3).setImmovable(true))
        this.guardGroup2.children.iterate( g => g.play('guard').setScale(3).setImmovable(true))

        this.spriteChest = this.add.sprite(270, 150, 'u3').play('chest').setScale(2);
        this.spriteChest.setVisible(false)

        // player position in city3
        this.player.x = 310;
        this.player.y = 500;

        this.time.addEvent({ delay: 3000, callback: this.showGuardfunc, callbackScope: this, loop: true });


        if ( this.inventory.displayHorse == 1) {
            this.horse = this.physics.add.sprite(100, 550, 'u3').play('horse').setScale(2);
            this.physics.add.collider(this.horse, this.guardGroup1);
            this.physics.add.collider(this.horse, this.guardGroup2);
        }
        
        this.player = this.physics.add.sprite(this.player.x, this.player.y, 'u3').play('ranger').setScale(2);

        castleLayer.setTileIndexCallback(5, this.worldmap, this);
        this.physics.add.overlap(castleLayer, this.player);

        // Overlap with cleric
        this.physics.add.overlap(this.player, this.british, this.returnChest, null, this);

        //this.physics.add.overlap(this.player, this.horse, this.collectHorse, null, this);

        castleLayer.setCollisionByProperty({ walls: true });

        // What will collider with what layers
        this.physics.add.collider(castleLayer, this.player);

        this.physics.add.collider(this.player, this.british);
        this.physics.add.collider(this.player, this.guardGroup1);
        this.physics.add.collider(this.player, this.guardGroup2);

        //this.physics.add.collider(this.player, this.cleric, this.returnChest, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

    }

    update() {

        let speed = 256;

        // Attached horse to player ( +32 offset )
        if ( this.inventory.displayHorse == 1) {
            this.horse.x = this.player.x + 32
            this.horse.y = this.player.y
        }    

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
        } else if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(speed);
        } else {
            this.player.body.setVelocity(0);
        }

    }

    showGuardfunc() {

        if ( this.showGuard == true ) {
            console.log("*** Hide guard")
            this.guardGroup1.children.iterate( g => g.setVisible(false))
            this.guardGroup1.children.iterate( g => g.disableBody(true))
            this.showGuard = false
        } else {
            console.log("*** Show guard")
            this.guardGroup1.children.iterate( g => g.setVisible(true))
            this.guardGroup1.children.iterate( g => {
                console.log(g)
                g.enableBody(false, g.x, g.y, true) })
            this.showGuard = true
        }
    }

    worldmap(player, tile) {
        //console.log('Tile id: ', tile.index);

        if (tile.index !== 5) return;
        console.log('city3 to world');

        // Set position beside city2 in worldmap
        player.x = 300;
        player.y = 200;

        // Disable display horse on next entry
        if ( this.inventory.displayHorse == 1) {
              this.inventory.displayHorse = 0
              this.inventory.horse++  
        }    

        this.scene.start('world', {
            player: player,  inventory : this.inventory
        });

    }

    returnChest(player, tile) {
        console.log('Return chest to british');
   
        if ( this.inventory.chest > 0 ) {
            this.pingSnd.play();
            this.inventory.chest--;
            console.log("chest: ", this.inventory.chest)
            this.spriteChest.setVisible(true)      
            this.scene.start('city3Story', {
                player: player,  inventory : this.inventory
        });  
        }
        
        return false;
    }

    collectHorse(player, horse) {
        console.log('Collect Horse', this.inventory.horse);
        this.inventory.horse++;
        this.horse.x = this.player.x + 32
        this.horse.y = this.player.y
        return false;
    }


}
