import {
  Container,
  DialogProps,
  Modal,
  Typography,
  Button,
  Avatar,
  Box,
  Divider,
  Stack,
  TableBody,
  TableRow,
  TableCell,
  Grid,
} from '@mui/material';
import { useRef, useState } from 'react';
import Bill from '@/types/Bill';
import MuiTable, { applySortFilter, getComparator } from '@/components/Tables/MuiTable';
import Label from '@/components/Label';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import IOrder from '@/types/Order';
// import logo from '@/assets/logo/Easy-Eats-Black-green-h.png';

const CULUMNS = [
  { id: 'order_id', label: 'ID', searchable: true },
  { id: 'user.name', label: 'Client', searchable: true },
  { id: '', label: 'Quantite des produit', searchable: false },
  { id: 'totalAmount', label: 'Prix', searchable: false },
  // TODO: ADD CLIENT FEE AND RESTAURANT FEE
];

export default function BillDetailsModal({
  bill,
  isModalOpen,
  handleModalClose,
}: {
  bill: Omit<Bill, '_id'> & Partial<Pick<Bill, '_id'>>;
  isModalOpen: boolean;
  handleModalClose: () => void;
}) {
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper');
  const [showExtra, setShowExtra] = useState(false);
  const docRef = useRef(null);

  // table
  const [orders] = useState(bill.orders);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchBy, setSearchBy] = useState('bill_id');

  const onDecline = () => handleModalClose();

  const handlePrint = async () => {
    if (!docRef.current) return;

    // Remove the hidden hided elements for printing
    const elements = document.querySelectorAll('.hide-to-pdf') as any as HTMLElement[];
    elements.forEach((e) => {
      e.style.display = 'none';
    });

    const pdf = new jsPDF('p', 'px', 'a4'); // A4 size PDF
    const pageWidth = pdf.internal.pageSize.getWidth() - 20;
    const pageHeight = pdf.internal.pageSize.getHeight() + 20;

    const canvas = await html2canvas(docRef.current, {
      // scrollY: -window.scrollY,
    });
    // const imgData = canvas.toDataURL('application/pdf');

    const contentWidth = canvas.width;
    const contentHeight = canvas.height;

    // Scale the content to fit the PDF width
    const scaleFactor = pageWidth / contentWidth;
    const scaledContentHeight = contentHeight * scaleFactor;

    // Divide the content into pages
    const pagesNeeded = Math.ceil(scaledContentHeight / pageHeight) + 1;

    console.log({ pagesNeeded, value: scaledContentHeight / pageHeight });

    let yOffset = 0;

    for (let i = 0; i < pagesNeeded; i++) {
      const canvas = await html2canvas(docRef.current, {
        height: pageHeight * 2,
        y: pageHeight * 2 * i + 1,
      });
      const imgData = canvas.toDataURL('application/pdf');

      if (i > 0) pdf.addPage();
      pdf.addImage(
        imgData,
        'PDF',
        10,
        10,
        pageWidth,
        scaledContentHeight > pageHeight ? pageHeight : scaledContentHeight
      );
      yOffset += pageHeight / scaleFactor;

      // Slice content for the next page
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Restore the hidden elements
    elements.forEach((e) => {
      e.style.display = '';
    });
    const blobURL = URL.createObjectURL(pdf.output('blob'));
    window.open(blobURL, '_blank')?.print();
    // pdf.
  };

  // console.log(Array(25).fill(bill.orders[0]));

  const TableBodyComponent = ({data = []}) => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orders.length) : 0;

    return (
      <TableBody>
        {data
          // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((order: IOrder, index: number) => {
            return (
              <>
                <TableRow hover key={index} tabIndex={-1}>
                  <TableCell align="left">
                    <Label variant="ghost" color="success">
                      {index + 1}
                    </Label>
                  </TableCell>
                  <TableCell align="left">#{order.orderId}</TableCell>
                  <TableCell align="left">{order.user.name}</TableCell>
                  <TableCell align="left">{order.items.length + order.drinks.length}</TableCell>
                  <TableCell align="left">{order.totalAmount.toFixed(2)} DZD</TableCell>
                </TableRow>
              </>
            );
          })}
        {emptyRows < 0 && (
          <TableRow style={{ height: 53 * emptyRows }}>
            <TableCell colSpan={6} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <Modal
      sx={{ width: '95%', height: '100vh', overflow: 'scroll' }}
      open={isModalOpen}
      onClose={handleModalClose}
      aria-labelledby={'restaurant bill information'}
    >
      <>
        <Container
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
            overflow: 'scroll',
          }}
        >
          <Container ref={docRef}>
            {/* header */}
            <Container
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                minHeight: 'max-content',
                alignItems: 'center',
              }}
            >
              <Box>
                <Avatar src={"/static/logo/Easy-Eats-Black-Green-h.png"} sx={{ width: 'auto', height: 50, borderRadius: 0 }} />
                <Typography variant="body2">+213 540059027</Typography>
                <Typography variant="body2">contact@easyeats.dz</Typography>
                <Typography variant="body2">www.easyeats.dz</Typography>
              </Box>
              <Box>
                {/* <Avatar src={logo} sx={{ width: 'auto', height: 50, borderRadius: 0 }} /> */}
                <Typography variant="h3">{bill.restaurant.name}</Typography>
                <Typography variant="body2">{bill.restaurant.address}</Typography>
                <Typography variant="body2">{bill.restaurant.mobile}</Typography>
              </Box>
            </Container>
            <Divider sx={{ my: 4 }} />
            <Container>
              <Typography variant="h4">Facture N: {bill.bill_id}</Typography>
              <Typography variant="subtitle2">Facture ID: {bill._id}</Typography>
            </Container>
            <Divider sx={{ my: 4 }} />
            <MuiTable
              data={orders}
              columns={CULUMNS}
              page={page}
              setPage={setPage}
              order={order}
              setOrder={setOrder}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              selected={selected}
              setSelected={setSelected}
              filterName={filterName}
              setFilterName={setFilterName}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              TableBody={TableBodyComponent}
              searchFields={['order_id', 'user.name']}
            />
            <Container
              sx={{
                width: '100%',
                minWidth: 'max-content',
                my: 5,
                // bgcolor: 'tomato',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'right',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2">Total Vente</Typography>
                <Typography variant="body1">{bill.totalSaleAmount.toFixed(2)} DZD</Typography>
              </Box>
              <Divider sx={{ mb: 5, borderBottomWidth: 8 }} />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">Frais Client</Typography>
                <Typography variant="body1">{bill.clientFee.toFixed(2)} DZD</Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">Frais Restaurant</Typography>
                <Typography variant="body1">{bill.restaurantFee.toFixed(2)} DZD</Typography>
              </Box>
              <Divider />
              <Divider />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{bill.totalFee.toFixed(2)} DZD</Typography>
              </Box>
              <Divider />
            </Container>
            <Box sx={{ p: 5 }}>
              <Typography variant="h3" align="right">
                Signature
              </Typography>
            </Box>
          </Container>
          <Button onClick={handlePrint} variant="contained" sx={{ my: 5, px: 5, alignContent: 'right' }}>
            print
          </Button>
        </Container>
      </>
    </Modal>
  );
}
