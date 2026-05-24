import { BsGithub, BsYoutube } from 'react-icons/bs';
import { IoIosCall } from 'react-icons/io';

export default function MobileDock() {
  const handleEmailClick = () => {
    window.location.href = 'mailto:abdullahmsultan1@gmail.com';
  };

  const handleGithubClick = () => {
    window.open('https://github.com/amsultan2010', '_blank');
  };

  const handleMusicClick = () => {
    window.open('https://music.youtube.com/@amsultan303', '_blank');
  };

  const handleProjectsClick = () => {
    window.location.href = '/projects';
  };

  const handlePicturesClick = () => {
    window.location.href = '/pictures';
  };

  return (
    <div className='fixed bottom-0 left-0 right-0 md:hidden'>
      <div className='mx-3 mb-2 p-2 bg-gradient-to-t from-gray-700 to-gray-800 backdrop-blur-xl rounded-2xl flex justify-around items-center max-w-[380px] mx-auto'>
        <button
          onClick={handleProjectsClick}
          className='flex flex-col items-center cursor-pointer'
        >
          <div className='w-12 h-12 rounded-xl flex items-center justify-center'>
            <img 
              src='/icons/folder.png'
              alt='Projects'
              className='w-11 h-11 object-contain'
              style={{width: '70px !important', height: '70px !important', minWidth: '70px', minHeight: '70px', maxWidth: 'none', maxHeight: 'none'}}
            />
          </div>
        </button>

        <button
          onClick={handlePicturesClick}
          className='flex flex-col items-center cursor-pointer'
        >
          <div className='w-12 h-12 rounded-xl flex items-center justify-center'>
            <img 
              src='/icons/photos.png' 
              alt='Pictures'
              className='w-11 h-11 object-contain'
              style={{width: '54px !important', height: '54px !important', minWidth: '54px', minHeight: '54px', maxWidth: 'none', maxHeight: 'none'}}
            />
          </div>
        </button>

        <a href='tel:+1234567890' className='flex flex-col items-center'>
          <div className='w-12 h-12 bg-gradient-to-t from-green-600 to-green-400 rounded-xl flex items-center justify-center'>
            <IoIosCall size={26} className='text-white' />
          </div>
        </a>

        <button
          onClick={handleEmailClick}
          className='flex flex-col items-center cursor-pointer'
        >
          <div className='w-12 h-12 rounded-xl flex items-center justify-center'>
            <img 
              src='/icons/email.png'
              alt='Email'
              className='w-11 h-11 object-contain'
              style={{width: '50px !important', height: '50px !important', minWidth: '50px', minHeight: '50px', maxWidth: 'none', maxHeight: 'none'}}
            />
          </div>
        </button>

        <button
          onClick={handleGithubClick}
          className='flex flex-col items-center cursor-pointer'
        >
          <div className='w-12 h-12 bg-gradient-to-t from-black to-black/60 rounded-xl flex items-center justify-center'>
            <BsGithub size={24} className='text-white' />
          </div>
        </button>

        <button
          onClick={handleMusicClick}
          className='flex flex-col items-center cursor-pointer'
        >
          <div className='w-12 h-12 bg-gradient-to-t from-black to-black/60 rounded-xl flex items-center justify-center'>
            <BsYoutube size={24} className='text-[#ff0033]' />
          </div>
        </button>
      </div>
    </div>
  );
}
