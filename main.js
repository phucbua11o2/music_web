const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY= 'PLAYER'
const playlist = $('.playlist')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn =$('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem('PLAYER_STORAGE_KEY'))||{},
    songs: [
        {
            name:'Attention',
            singer:'CharliePuth',
            image:'./img/1.png',
            path:'./music/Attention-CharliePuth.mp3'
        },
        {
            name:'Nevada',
            singer:'Vicetone',
            image:'./img/6.png',
            path:'./music/Nevada-Monstercat.mp3'
        },

        {
            name:'SummertimeSunshine',
            singer:'K391',
            image:'./img/8.png',
            path:'./music/SummertimeSunshine-K391.mp3'
        },

        {
            name:'Chosen',
            singer:'TheFatRatLauraBrehmAnnaYvette',
            image:'./img/2.png',
            path:'./music/Chosen-TheFatRatLauraBrehmAnnaYvette.mp3'
        },
    
        {
            name:'WeDonTTalkAnymore',
            singer:'SelenaGomez-CharliePuth',
            image:'./img/10.png',
            path:'./music/WeDonTTalkAnymoreFeatSelenaGomez-CharliePuth.mp3'
        },
    
        {
            name:'Reality',
            singer:'JamesBrown',
            image:'./img/5.png',
            path:'./music/Reality-JamesBrown.mp3'
        },
    
        {
            name:'TheHills',
            singer:'TheWeeknd',
            image:'./img/9.png',
            path:'./music/TheHills-TheWeeknd.mp3'
        }
    ],
    setConfig: function(key,value){
        this.config[key] = value;
        localStorage.setItem('PLAYER_STORAGE_KEY',JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song,index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                        </div>
                </div>            
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function(){
        Object.defineProperty(this,'currentSong',{
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    handlleEvent: function(){
        const _this =this
        const cdWidth = cd.offsetWidth
        //Xử lý CD quay / dừng
         const cdThumbAnimate=cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration:10000, //quay trong 10s
            iterations:Infinity //quay liên tục
        })
        cdThumbAnimate.pause()
        //Xử lý phóng to thu nhỏ cd
        document.onscroll= function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop
            //console.log(scrollTop)
            cd.style.width = newCdWidth >0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth

        }
        //Xử lý khi click play button
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause()
            }else{                
                audio.play()                
            }
            
        }
        //Khi song dc play
        audio.onplay=function(){
            _this.isPlaying=true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //Khi song pause
        audio.onpause=function(){
            _this.isPlaying=false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //Khi tiến độ song thay đổi
        audio.ontimeupdate=function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime /audio.duration *100)
                progress.value = progressPercent

            }
            
        }
        //Xử lý khi tua Song
        progress.onchange=function(e){
            const seekTime = audio.duration / 100 *e.target.value
            audio.currentTime= seekTime
        }
        //Khi next Songs
        nextBtn.onclick=function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        //Khi prev Songs
        prevBtn.onclick=function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        //Xử lý bật tắt random song
        randomBtn.onclick = function(e){
            _this.isRandom= !_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
        }

        //Xử lý next khi audio kết thúc
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }
        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            // bắt cả con của Song           
           if(songNode||e.target.closest('.option')){
            //Xử lý khi click vào playlist   
            if(songNode){
              //  console.log(songNode.getAttribute('data-index'))
              _this.currentIndex = Number(songNode.dataset.index)
              _this.loadCurrentSong()
              _this.render()
              audio.play()
            }
            //Xử lý option trong song
            if(e.target.closest('.option')){

            }
           }
        }
        //Xử lý vòng lặp songs
        repeatBtn.onclick= function(e){
             _this.isRepeat=!_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
             repeatBtn.classList.toggle('active',_this.isRepeat)
        }
    },
    scrollToActiveSong : function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior : 'smooth',
                block : 'nearest',
            })
        },300)
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    loadCurrentSong: function(){
        
        
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        //console.log(heading, cdThumb, audio)
    },
    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex>=this.songs.length){
            this.currentIndex=0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex<0){
            this.currentIndex= this.songs.length-1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(newIndex ===this.currentIndex)
        this.currentIndex=newIndex
        this.loadCurrentSong()
    },
    start:function(){
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        //lắng nghe/xử lý các sk(DOM event)
        this.handlleEvent()

        //Tải thông tin bài đầu tiên vào UI khi vào ứng dụng
        this.loadCurrentSong()
        //render playlist
        this.render()

        //hiện thị trạng thái ban đầu của button repeat và random
        repeatBtn.classList.toggle('active',this.isRepeat)
        randomBtn.classList.toggle('active',this.isRandom)
    }
}
app.start()


