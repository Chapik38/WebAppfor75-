const { createApp } = Vue;

const categories = ['CPU', 'MOTHERBOARD', 'RAM', 'GPU', 'PSU', 'STORAGE', 'COOLER'];
const categoryLabels = {
  CPU: 'Процессор',
  MOTHERBOARD: 'Материнская плата',
  RAM: 'Оперативная память',
  GPU: 'Видеокарта',
  PSU: 'Блок питания',
  STORAGE: 'Накопитель',
  COOLER: 'Охлаждение'
};
const categoryIcon = {
  CPU: '🧠',
  MOTHERBOARD: '🧩',
  RAM: '⚡',
  GPU: '🎮',
  PSU: '🔌',
  STORAGE: '💾',
  COOLER: '❄️'
};
const componentImageMap = {
  'AMD Ryzen 5 5600': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/AMD_Ryzen_5_1600_box.jpg/320px-AMD_Ryzen_5_1600_box.jpg',
  'Intel Core i5-12400F': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Intel_i5-8600k.jpg/320px-Intel_i5-8600k.jpg',
  'MSI B550 Tomahawk': 'https://asset.msi.com/resize/image/global/product/product_2_20200630135039_5efae1cf648de.png62405b38c58fe0f07fcef2367d8a9ba1/600.png',
  'ASUS PRIME B660M-A': 'https://dlcdnwebimgs.asus.com/gain/4f449cf6-5927-40eb-b08d-4fab75d14318/',
  'Corsair Vengeance 16GB DDR4': 'https://www.corsair.com/cdn/shop/files/CMK16GX4M2B3200C16_01.png?v=1701886641&width=600',
  'NVIDIA RTX 3060': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/GeForce_RTX_3060.jpg/320px-GeForce_RTX_3060.jpg',
  'AMD RX 7800 XT': 'https://www.amd.com/content/dam/amd/en/images/products/graphics/2621617-radeon-rx-7800xt.jpg',
  'Seasonic 550W': 'https://seasonic.com/pub/media/catalog/product/f/o/focus-gm-550-1.jpg',
  'Corsair RM750x': 'https://assets.corsair.com/image/upload/f_auto,q_auto/products/Power-Supply-Units/base-rmx-series-2021-config/Gallery/RM750x_01.webp',
  'Samsung 970 EVO Plus 1TB': 'https://images.samsung.com/is/image/samsung/p6pim/levant/mz-v7s1t0bw/gallery/levant-970-evo-plus-nvme-m-2-ssd-mz-v7s1t0bw-271064552?$650_519_PNG$',
  'Cooler Master Hyper 212': 'https://www.coolermaster.com/catalog/coolers/cpu-air-coolers/hyper-212-black-edition/gallery/hyper-212-black-edition-01.png'
};

createApp({
  data() {
    return {
      categories,
      categoryLabels,
      categoryIcon,
      components: [],
      selected: { CPU: null, MOTHERBOARD: null, RAM: null, GPU: null, PSU: null, STORAGE: null, COOLER: null },
      result: null,
      pickerOpen: false,
      pickerCategory: 'CPU',
      pickerSearch: '',
      pickerTag: '',
      favorites: [],
      compareList: []
    };
  },
  computed: {
    grouped() {
      const map = {};
      this.categories.forEach((c) => {
        map[c] = this.components.filter((x) => x.category === c);
      });
      return map;
    },
    selectedCount() {
      return this.categories.filter((c) => !!this.selected[c]).length;
    },
    cartItems() {
      return this.categories
        .map((category) => this.selectedItem(category))
        .filter(Boolean);
    },
    pickerItems() {
      const source = this.grouped[this.pickerCategory] || [];
      return source.filter((x) => {
        const name = String(x.name || '').toLowerCase();
        const meta = `${x.socket || ''} ${x.ram_type || ''} ${x.storage_interface || ''} ${x.wattage || ''} ${x.tdp || ''}`.toLowerCase();
        const byText = !this.pickerSearch || name.includes(this.pickerSearch.toLowerCase());
        const byTag = !this.pickerTag || this.matchesTag(x, this.pickerTag) || meta.includes(this.pickerTag.toLowerCase());
        return byText && byTag;
      });
    },
    pickerFilters() {
      const source = this.grouped[this.pickerCategory] || [];
      const filters = new Set();
      if (this.pickerCategory === 'CPU' || this.pickerCategory === 'MOTHERBOARD') {
        source.forEach((x) => x.socket && filters.add(x.socket));
      } else if (this.pickerCategory === 'RAM') {
        source.forEach((x) => x.ram_type && filters.add(x.ram_type));
      } else if (this.pickerCategory === 'GPU') {
        filters.add('До 200W');
        filters.add('200W+');
      } else if (this.pickerCategory === 'PSU') {
        filters.add('До 600W');
        filters.add('600W+');
      } else if (this.pickerCategory === 'STORAGE') {
        source.forEach((x) => x.storage_interface && filters.add(x.storage_interface));
      } else if (this.pickerCategory === 'COOLER') {
        filters.add('Воздушное');
      }
      return [...filters];
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      window.location.href = '/login';
    },
    payload() {
      const payload = {};
      this.categories.forEach((c) => {
        if (this.selected[c]) payload[c] = this.selected[c];
      });
      return payload;
    },
    selectedItem(category) {
      const id = this.selected[category];
      if (!id) return null;
      return this.grouped[category].find((x) => x.id === id) || null;
    },
    pick(category, id) {
      this.selected[category] = id;
      this.pickerOpen = false;
    },
    openPicker(category) {
      this.pickerCategory = category;
      this.pickerSearch = '';
      this.pickerTag = '';
      this.pickerOpen = true;
    },
    itemThumb(item) {
      return componentImageMap[item.name] || 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/PC-Components.jpg/320px-PC-Components.jpg';
    },
    toggleFavorite(itemId) {
      if (this.favorites.includes(itemId)) {
        this.favorites = this.favorites.filter((x) => x !== itemId);
      } else {
        this.favorites.push(itemId);
      }
    },
    toggleCompare(itemId) {
      if (this.compareList.includes(itemId)) {
        this.compareList = this.compareList.filter((x) => x !== itemId);
        return;
      }
      if (this.compareList.length >= 3) return;
      this.compareList.push(itemId);
    },
    isFavorite(itemId) {
      return this.favorites.includes(itemId);
    },
    inCompare(itemId) {
      return this.compareList.includes(itemId);
    },
    matchesTag(item, tag) {
      if (!tag) return true;
      if (tag === 'До 200W') return Number(item.tdp || 0) > 0 && Number(item.tdp) < 200;
      if (tag === '200W+') return Number(item.tdp || 0) >= 200;
      if (tag === 'До 600W') return Number(item.wattage || 0) > 0 && Number(item.wattage) < 600;
      if (tag === '600W+') return Number(item.wattage || 0) >= 600;
      if (tag === 'Воздушное') return true;
      const meta = `${item.socket || ''} ${item.ram_type || ''} ${item.storage_interface || ''}`.toLowerCase();
      return meta.includes(tag.toLowerCase());
    },
    async api(path, options = {}) {
      const res = await fetch(path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          ...(options.headers || {})
        }
      });
      const data = await res.json();
      if (res.status === 401) {
        this.logout();
        throw new Error('Сессия истекла');
      }
      if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
      return data;
    },
    async loadComponents() {
      const data = await this.api('/api/components');
      this.components = data.components;
    },
    async analyze() {
      this.result = await this.api('/api/analyzer', {
        method: 'POST',
        body: JSON.stringify(this.payload())
      });
    }
  },
  async mounted() {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login';
      return;
    }
    await this.loadComponents();
  }
}).mount('#analyzerApp');
