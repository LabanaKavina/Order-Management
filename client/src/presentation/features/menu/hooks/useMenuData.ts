import { useEffect } from 'react';
import { useMenuContext } from '../context/MenuContext';

export function useMenuData() {
  const { menuService, menuItems, loading, error, setMenuItems, setLoading, setError } = useMenuContext();

  useEffect(() => {
    let cancelled = false;

    const fetchMenu = async () => {
      setLoading(true);
      try {
        const items = await menuService.getMenu();
        if (!cancelled) {
          setMenuItems(items);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMenu();
    return () => { cancelled = true; };
  }, [menuService, setMenuItems, setLoading, setError]);

  return { menuItems, loading, error };
}
