import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

/** Текущий трек = выбранный элемент очереди. */
export const useCurrentTrack = () =>
   useAppSelector((s) => s.queue.items[s.queue.index] ?? null);
