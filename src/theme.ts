import {StyleSheet} from 'react-native';

export const appStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f3f9',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e8f0',
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d2233',
    marginBottom: 8,
  },
  bodyText: {
    color: '#424863',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#d4d8eb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f7f8fe',
  },
  chipText: {
    color: '#394062',
    fontWeight: '600',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#1b66ff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  subtleButton: {
    borderWidth: 1,
    borderColor: '#b9c4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#edf1ff',
  },
  subtleButtonText: {
    color: '#2555d1',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccd1e6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#1d2233',
    backgroundColor: '#ffffff',
  },
});
