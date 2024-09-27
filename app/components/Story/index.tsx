import React from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import Camera from './Camera';
import Media from './Media';
import { Button } from 'react-native-paper';

const Story = props => {
  const [visible, setVisible] = React.useState(false);
  const [mediaVisible, setMediaVisible] = React.useState(false);
  const [mediaData, setMediaData] = React.useState(null);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  return (
    <View style={styles.container}>
      <Button icon="camera" mode="contained" onPress={showModal}>
        Add to Story
      </Button>
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={() => setVisible(false)}>
        {mediaData ? (
          <Media {...props} data={mediaData} setMediaData={setMediaData} />
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

export default Story;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
