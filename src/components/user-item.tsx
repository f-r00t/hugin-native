import { useMemo, useState } from 'react';

import { Dimensions, StyleSheet, View } from 'react-native';

import { nameMaxLength } from '@/config';
import type { User } from '@/types';
import { getAvatar } from '@/utils';

import { Avatar, TextField, TouchableOpacity } from './_elements';
import { UserDetails } from './user-details';

  export const UserItem: React.FC<User> = (props) => {

  let { address, name, avatar, online } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const w = Dimensions.get('window').width;
  const width = w / 2;
  if (!avatar) avatar = useMemo(() => getAvatar(address ?? ''), [address]);

  function onPress() {
    setModalVisible(true);
  }

  function onClose() {
    setModalVisible(false);
  }

  return (
    <TouchableOpacity style={[styles.onlineUser, { width, opacity: online === false ? 0.3 : 1 }]} onPress={onPress}>
      <UserDetails
        visible={modalVisible}
        address={address ?? ''}
        name={name}
        avatar={avatar}
        online={online}
        onClose={onClose}
      />
      <Avatar size={28} base64={avatar} />
      <TextField size="xsmall" maxLength={nameMaxLength} style={styles.name}>
        {name}
      </TextField>
      {props?.muted &&
      <View><TextField size={"xsmall"}> 🔇</TextField></View>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  name: { marginLeft: 6 },
  onlineUser: {
    flexDirection: 'row',
    margin: 1,
    marginBottom: 4,
    alignItems: 'center',
  },
});
