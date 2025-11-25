import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { toast } from '@/components/ui/use-toast';

interface Order {
  id: string;
  product: string;
  quantity: number;
  price: number;
  status: string;
  date: string;
  customer: string;
}

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<Order[]>([
    { id: '001', product: 'Ноутбук Dell', quantity: 5, price: 85000, status: 'Доставлен', date: '2024-11-20', customer: 'ООО Рога и Копыта' },
    { id: '002', product: 'Монитор Samsung', quantity: 10, price: 25000, status: 'В обработке', date: '2024-11-22', customer: 'ИП Иванов' },
    { id: '003', product: 'Клавиатура Logitech', quantity: 15, price: 3500, status: 'Доставлен', date: '2024-11-18', customer: 'ООО ТехноМир' },
    { id: '004', product: 'Мышь Razer', quantity: 20, price: 4500, status: 'Отменен', date: '2024-11-15', customer: 'ИП Петров' },
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: 'P001', name: 'Ноутбук Dell', stock: 45, price: 85000, category: 'Компьютеры' },
    { id: 'P002', name: 'Монитор Samsung', stock: 78, price: 25000, category: 'Периферия' },
    { id: 'P003', name: 'Клавиатура Logitech', stock: 120, price: 3500, category: 'Периферия' },
    { id: 'P004', name: 'Мышь Razer', stock: 95, price: 4500, category: 'Периферия' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const revenueData = [
    { month: 'Янв', revenue: 450000, orders: 25 },
    { month: 'Фев', revenue: 520000, orders: 30 },
    { month: 'Мар', revenue: 480000, orders: 28 },
    { month: 'Апр', revenue: 610000, orders: 35 },
    { month: 'Май', revenue: 720000, orders: 42 },
    { month: 'Июн', revenue: 680000, orders: 38 },
  ];

  const categoryData = [
    { name: 'Компьютеры', value: 45, color: '#8B5CF6' },
    { name: 'Периферия', value: 30, color: '#0EA5E9' },
    { name: 'Комплектующие', value: 25, color: '#D946EF' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const newOrders: Order[] = json.map((row: any, index: number) => ({
          id: row['ID'] || row['id'] || `AUTO-${Date.now()}-${index}`,
          product: row['Товар'] || row['product'] || row['Product'] || 'Не указано',
          quantity: Number(row['Количество'] || row['quantity'] || row['Quantity'] || 0),
          price: Number(row['Цена'] || row['price'] || row['Price'] || 0),
          status: row['Статус'] || row['status'] || row['Status'] || 'В обработке',
          date: row['Дата'] || row['date'] || row['Date'] || new Date().toISOString().split('T')[0],
          customer: row['Клиент'] || row['customer'] || row['Customer'] || 'Не указан',
        }));

        setOrders([...orders, ...newOrders]);
        toast({
          title: 'Файл загружен!',
          description: `Добавлено ${newOrders.length} заказов из Excel файла`,
        });
      } catch (error) {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось прочитать файл. Проверьте формат.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportOrders = () => {
    const exportData = orders.map(order => ({
      'ID': order.id,
      'Товар': order.product,
      'Клиент': order.customer,
      'Количество': order.quantity,
      'Цена': order.price,
      'Сумма': order.quantity * order.price,
      'Дата': order.date,
      'Статус': order.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказы');

    const fileName = `Заказы_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: 'Экспорт завершен!',
      description: `Файл ${fileName} успешно сохранен`,
    });
  };

  const handleExportProducts = () => {
    const exportData = products.map(product => ({
      'ID': product.id,
      'Название': product.name,
      'Категория': product.category,
      'На складе': product.stock,
      'Цена': product.price,
      'Общая стоимость': product.stock * product.price,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары');

    const fileName = `Товары_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: 'Экспорт завершен!',
      description: `Файл ${fileName} успешно сохранен`,
    });
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.quantity * order.price, 0);
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status === 'В обработке').length;

  const filteredOrders = orders.filter(order =>
    order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Доставлен': return 'bg-green-500';
      case 'В обработке': return 'bg-blue-500';
      case 'Отменен': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="lg:flex">
        <aside className="lg:w-64 bg-sidebar text-sidebar-foreground lg:min-h-screen p-6 hidden lg:block">
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              OrderFlow
            </h2>
          </div>
          <nav className="space-y-2">
            {[
              { icon: 'LayoutDashboard', label: 'Дашборд', value: 'dashboard' },
              { icon: 'ShoppingCart', label: 'Заказы', value: 'orders' },
              { icon: 'Package', label: 'Товары', value: 'products' },
              { icon: 'DollarSign', label: 'Финансы', value: 'finance' },
              { icon: 'BarChart3', label: 'Аналитика', value: 'analytics' },
              { icon: 'Warehouse', label: 'Склад', value: 'warehouse' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.value
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Система учета заказов
              </h1>
              <p className="text-muted-foreground">Контроль товаров и реализации в реальном времени</p>
            </div>
            <div className="flex gap-2">
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Icon name="Upload" size={18} className="mr-2" />
                    Импорт Excel
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <Icon name="Plus" size={18} className="mr-2" />
                Новый заказ
              </Button>
            </div>
          </div>

          <div className="lg:hidden mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
                <TabsTrigger value="orders">Заказы</TabsTrigger>
                <TabsTrigger value="products">Товары</TabsTrigger>
                <TabsTrigger value="finance">Финансы</TabsTrigger>
                <TabsTrigger value="analytics">Аналитика</TabsTrigger>
                <TabsTrigger value="warehouse">Склад</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Общая выручка
                    </CardTitle>
                    <Icon name="DollarSign" className="text-primary" size={20} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl lg:text-3xl font-bold">
                      {totalRevenue.toLocaleString('ru-RU')} ₽
                    </div>
                    <p className="text-xs text-green-500 mt-1">+12.5% от прошлого месяца</p>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Всего заказов
                    </CardTitle>
                    <Icon name="ShoppingCart" className="text-secondary" size={20} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl lg:text-3xl font-bold">{totalOrders}</div>
                    <p className="text-xs text-green-500 mt-1">+8 новых заказов</p>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      В обработке
                    </CardTitle>
                    <Icon name="Clock" className="text-accent" size={20} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl lg:text-3xl font-bold">{activeOrders}</div>
                    <p className="text-xs text-muted-foreground mt-1">Требуют внимания</p>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Товаров на складе
                    </CardTitle>
                    <Icon name="Package" className="text-destructive" size={20} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl lg:text-3xl font-bold">
                      {products.reduce((sum, p) => sum + p.stock, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">По всем категориям</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="TrendingUp" size={24} className="text-primary" />
                      Динамика выручки
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="PieChart" size={24} className="text-secondary" />
                      По категориям
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {categoryData.map((cat) => (
                        <div key={cat.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                            <span>{cat.name}</span>
                          </div>
                          <span className="font-semibold">{cat.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="ShoppingCart" size={24} className="text-primary" />
                      Все заказы
                    </CardTitle>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Поиск по заказам..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="sm:w-64"
                      />
                      <Button onClick={handleExportOrders} variant="outline">
                        <Icon name="Download" size={18} className="mr-2" />
                        Экспорт
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Товар</TableHead>
                          <TableHead>Клиент</TableHead>
                          <TableHead className="text-right">Кол-во</TableHead>
                          <TableHead className="text-right">Цена</TableHead>
                          <TableHead className="text-right">Сумма</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Статус</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.product}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{order.customer}</TableCell>
                            <TableCell className="text-right">{order.quantity}</TableCell>
                            <TableCell className="text-right">{order.price.toLocaleString('ru-RU')} ₽</TableCell>
                            <TableCell className="text-right font-semibold">
                              {(order.quantity * order.price).toLocaleString('ru-RU')} ₽
                            </TableCell>
                            <TableCell className="text-sm">{order.date}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-end mb-4">
                <Button onClick={handleExportProducts} variant="outline">
                  <Icon name="Download" size={18} className="mr-2" />
                  Экспорт товаров
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="hover-scale">
                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant="outline">{product.category}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">На складе:</span>
                          <span className="font-bold">{product.stock} шт</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Цена:</span>
                          <span className="font-bold text-primary">{product.price.toLocaleString('ru-RU')} ₽</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="BarChart3" size={24} className="text-secondary" />
                    Количество заказов по месяцам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {(activeTab === 'analytics' || activeTab === 'warehouse') && (
            <div className="animate-fade-in">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Icon name="Construction" size={64} className="text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Раздел в разработке</h3>
                  <p className="text-muted-foreground">Скоро здесь появится подробная информация</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;