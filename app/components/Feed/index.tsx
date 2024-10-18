import React, { useEffect } from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import Camera from './Camera';
import Media from './Media';
import Story from './Story';
import { Button } from 'react-native-paper';

// TODO: Define props type
const Feed = props => {
  const [visible, setVisible] = React.useState(false);
  const [storyMode, setStoryMode] = React.useState(false);
  const [mediaVisible, setMediaVisible] = React.useState(false);
  const [mediaData, setMediaData] = React.useState<any | null>(null);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  useEffect(() => {
    setStoryMode(true);
    setMediaData(data[0]);
  }, []);
  return (
    <View style={styles.container}>
      <Button icon="camera" mode="contained" onPress={showModal}>
        Add to Story
      </Button>
      <Button icon="camera" mode="contained" onPress={showModal}>
        View Story
      </Button>
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={() => setVisible(false)}>
        {storyMode && mediaData ? (
          <Story
            {...props}
            data={data}
            setMediaData={setMediaData}
          />
        ) : mediaData ? (
          <Media
            {...props}
            story={mediaData}
            setMediaData={setMediaData}
            storyMode={storyMode}
          />
        ) : (
          <Camera
            {...props}
            hideModal={hideModal}
            setMediaVisible={setMediaVisible}
            setMediaData={setMediaData}
          />
        )}
      </Modal>
    </View>
  );
};
const data = [
  {
    type: 'video',
    path: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    type: 'video',
    path: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    type: 'video',
    path: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
];

export default Feed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
