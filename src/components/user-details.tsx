import { useEffect, useState } from 'react';

import { StyleSheet, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { getColors } from 'react-native-image-colors';

import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { MainScreens } from '@/config';
import {
  useGlobalStore,
  useThemeStore,
  setStoreCurrentContact,
  setStoreMessages,
} from '@/services';
import { lightenHexColor } from '@/services/utils';
import { getAvatar } from '@/utils';
import type { MainStackNavigationType } from '@/types';

import { Avatar, TextButton, TextField, TouchableOpacity } from './_elements';
import { ModalCenter } from './_layout';

import { addContact } from '../services/bare/sqlite';
import { setLatestMessages, setMessages } from '../services/bare/contacts';
import { Beam, sync_push_registrations } from '../lib/native';

interface Props {
  visible: boolean;
  address: string;
  name?: string;
  avatar?: string;
  online?: boolean;
  onClose: () => void;
}

export const UserDetails: React.FC<Props> = ({
  visible,
  address,
  name,
  avatar,
  online,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<MainStackNavigationType>();
  const theme = useThemeStore((state) => state.theme);
  const myUserAddress = useGlobalStore((state) => state.address);

  // Gated on `visible` — one instance is mounted per message.
  const derivedOnline = useGlobalStore((state) =>
    visible
      ? Object.values(state.roomUsers).some((list) =>
          list?.some((u) => u.address === address),
        )
      : false,
  );
  const isOnline = online ?? derivedOnline;

  const [headerColor, setHeaderColor] = useState<string>(theme.card);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    async function getUserColor() {
      const avatarColor =
        avatar && avatar.length > 0 ? avatar : getAvatar(address ?? '');
      try {
        const colors: any = await getColors(
          'data:image/png;base64,' + avatarColor,
          {
            fallback: '#228B22',
            cache: true,
            key: (address ?? '').substring(0, 16),
          },
        );
        const raw = colors?.background || colors?.dominant;
        if (!cancelled && raw) {
          setHeaderColor(lightenHexColor(raw, 55));
        }
      } catch (e) {}
    }

    getUserColor();
    return () => {
      cancelled = true;
    };
  }, [visible, avatar, address]);

  const displayName = name && name.length > 0 ? name : 'Anon';
  const isSelf = address === myUserAddress;

  const compactAddress =
    address && address.length > 16
      ? `${address.slice(0, 6)}...${address.slice(-6)}`
      : address;

  function onCopyAddress() {
    if (!address) return;
    Clipboard.setString(address);
    Toast.show({ text1: t('copied', 'Copied'), type: 'info' });
  }

  async function onMessageUser() {
    onClose();

    // xkr address only (99 chars)
    const xkrAddr = address.substring(0, 99);

    setStoreMessages([]);
    await addContact(displayName, xkrAddr, '', true);
    Beam.new(xkrAddr);
    sync_push_registrations();
    setLatestMessages();

    await setMessages(xkrAddr, 0);
    setStoreCurrentContact(xkrAddr);

    navigation.navigate(MainScreens.MessageScreen, {
      name: displayName,
      roomKey: xkrAddr,
    });
  }

  return (
    <ModalCenter
      visible={visible}
      closeModal={onClose}
      style={styles.modal}>
      <View style={[styles.banner, { backgroundColor: headerColor }]} />

      <View style={styles.body}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatarRing, { backgroundColor: theme.card }]}>
            <View style={styles.avatarClip}>
              <Avatar size={84} base64={avatar} address={address} />
            </View>
          </View>
          <View
            style={[
              styles.statusRing,
              { backgroundColor: theme.card, borderColor: theme.card },
            ]}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? '#3ba55d' : theme.mutedForeground },
              ]}
            />
          </View>
        </View>

        <TextField bold size="large">
          {displayName}
        </TextField>

        <TouchableOpacity onPress={onCopyAddress} style={styles.addressRow}>
          <TextField size="small" type="muted">
            {compactAddress}
          </TextField>
        </TouchableOpacity>

        {!isSelf && (
          <TextButton onPress={onMessageUser}>{t('messageUser')}</TextButton>
        )}
      </View>
    </ModalCenter>
  );
};

const styles = StyleSheet.create({
  modal: {
    padding: 0,
    overflow: 'hidden',
    width: 330,
    alignItems: 'stretch',
  },
  banner: {
    height: 96,
    alignSelf: 'stretch',
  },
  body: {
    alignSelf: 'stretch',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarWrap: {
    marginTop: -48,
    marginBottom: 10,
    width: 96,
    height: 96,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 6,
  },
  avatarClip: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
  },
  statusRing: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  addressRow: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 16,
  },
});
