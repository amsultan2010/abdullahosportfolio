const NameHeader = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '60px',
      left: '35px',
      zIndex: 100,
      fontFamily: 'MenoBanner-Condensed, sans-serif',
      fontSize: '1.8rem',
      fontWeight: 'normal',
      color: 'white',
      fontStyle: 'italic',
      margin: 0,
      padding: 0
    }}>
      Ronniel Gandhe

      <style>{`
        @font-face {
          font-family: 'MenoBanner-Condensed';
          src: url('/meno-banner-condensed-italic.otf') format('opentype');
          font-weight: normal;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default NameHeader;
