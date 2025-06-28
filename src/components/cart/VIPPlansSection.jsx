import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

/**
 * VIP Plans Section Component - Real API Implementation
 * Matches Flutter vipListContainerBuilder implementation exactly
 * Follows same props pattern as SelectedServicesSection
 *
 * Flutter Reference:
 * - Container with AppColor.orange background
 * - Row with stars and "Live the VIP life!" text
 * - Horizontal ListView.builder for VIP plans
 * - "Subscribe & save upto ₹6000*" promotional text
 *
 * API Data Structure (from backend VIP model):
 * - id: encrypted string
 * - plan_name: string
 * - price: decimal (original price)
 * - discount_price: decimal (discounted price)
 * - discount_percentage: decimal (can be null)
 * - validity_period: integer (days, converted to months)
 * - platform_fees: boolean (0/1)
 * - no_of_bookings: integer
 * - description: text
 * - image: string (S3 URL)
 * - status: boolean (0=inactive, 1=active)
 */
const VIPPlansSection = ({ cartState }) => {
  const { selectVipPlan, cartState: hookCartState } = useCart(); // Get both actions and state from hook
  const { user } = useAuth();

  // Get vipPlans from props but selectedVipPlan from hook for real-time updates
  const { vipPlans } = cartState;
  const { selectedVipPlan } = hookCartState;

  // Debug logging - using mixed data sources (vipPlans from props, selectedVipPlan from hook)
  console.log('🔄 VIPPlansSection: Rendering with mixed data sources:', {
    vipPlans,
    vipPlansLength: vipPlans?.length,
    vipPlansType: typeof vipPlans,
    vipPlansArray: Array.isArray(vipPlans),
    selectedVipPlan,
    selectedVipPlanId: selectedVipPlan?.id,
    userVipStatus: user?.isVipSubscriber,

    propsCartStateKeys: Object.keys(cartState),
    hookCartStateKeys: Object.keys(hookCartState),
    dataSource: 'vipPlans from props, selectedVipPlan from hook'
  });

  // Handle VIP plan selection - matches Flutter SelectCartVipPlanEvent
  const handleVipPlanSelect = async (plan) => {
    console.log('🔄 VIPPlansSection: Plan clicked!', {
      planId: plan.id,
      planName: plan.plan_name,
      isCurrentlySelected: selectedVipPlan?.id === plan.id,
      selectVipPlanFunction: typeof selectVipPlan
    });

    try {
      if (selectedVipPlan?.id === plan.id) {
        // Deselect if already selected - matches Flutter logic
        console.log('🔄 VIPPlansSection: Deselecting plan');
        await selectVipPlan(null);
      } else {
        // Select new plan
        console.log('🔄 VIPPlansSection: Selecting new plan');
        await selectVipPlan(plan);
      }
    } catch (error) {
      console.error('❌ VIPPlansSection: Failed to select VIP plan:', error);
    }
  };

  // Don't render if no cartState (same pattern as SelectedServicesSection)
  if (!cartState) {
    console.log('🔄 VIPPlansSection: Not rendering - No cartState');
    return null;
  }

  // Don't render if no VIP plans available
  if (!vipPlans || vipPlans.length === 0) {
    console.log('🔄 VIPPlansSection: Not rendering - No VIP plans available');
    return null;
  }

  // Don't render if user is already VIP subscriber
  // Matches Flutter: if (state.vipPlans.isNotEmpty && !constant.vipSubscriptionsStatus)
  if (user?.isVipSubscriber) {
    console.log('🔄 VIPPlansSection: Not rendering - User is VIP subscriber');
    return null;
  }

  // Debug VIP plans structure first
  console.log('🔍 VIPPlansSection: VIP plans structure analysis:', {
    vipPlans,
    firstPlan: vipPlans[0],
    firstPlanStatus: vipPlans[0]?.status,
    firstPlanStatusType: typeof vipPlans[0]?.status,
    allPlanStatuses: vipPlans.map(plan => ({ id: plan.id, status: plan.status, statusType: typeof plan.status }))
  });

  // TEMPORARY: Show all VIP plans regardless of status for development
  // TODO: In production, filter only active plans (status === 1)
  const activeVipPlans = vipPlans; // Show all plans for now

  console.log('🔍 VIPPlansSection: Showing all VIP plans (development mode):', {
    totalPlans: vipPlans.length,
    activePlans: activeVipPlans.length,
    allPlanStatuses: vipPlans.map(p => ({ id: p.id, status: p.status, name: p.plan_name }))
  });

  if (activeVipPlans.length === 0) {
    console.log('❌ VIPPlansSection: Not rendering - No VIP plans available');
    return null;
  }

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: '#FFA300', // Flutter AppColor.orange
        marginBottom: '27px', // Flutter margin: EdgeInsets.only(bottom: 27.h)
        paddingTop: '21px', // Flutter padding: EdgeInsets.symmetric(vertical: 21.h)
        paddingBottom: '21px'
      }}
    >
      {/* Header Row with Stars and Text - Exact Flutter Row match */}
      <div className="flex items-center justify-center">
        {/* Left Star Container - Flutter: Container(margin: EdgeInsets.symmetric(horizontal: 8.w), height: 36.h, width: 36.h, child: Image.asset(appAssets.stars)) */}
        <div
          className="flex items-center justify-center"
          style={{
            marginLeft: '8px',
            marginRight: '8px',
            height: '36px',
            width: '36px'
          }}
        >
          ⭐
        </div>

        {/* Text - Flutter: AppText.bold20(appLocalization.liveTheVipLife, color: AppColor.white) */}
        <span className="text-white font-bold text-xl">
          Live the VIP life!
        </span>

        {/* Right Star Container */}
        <div
          className="flex items-center justify-center"
          style={{
            marginLeft: '8px',
            marginRight: '8px',
            height: '36px',
            width: '36px'
          }}
        >
          ⭐
        </div>
      </div>

      {/* Spacing - Flutter: SizedBox(height: 21.h) */}
      <div style={{ height: '21px' }}></div>

      {/* Horizontal VIP Plans Container - Flutter: Container(height: 70.h, width: double.infinity, alignment: Alignment.center) */}
      <div
        className="flex items-center justify-center"
        style={{ height: '70px', width: '100%' }}
      >
        {/* ListView.builder - Flutter: ListView.builder(shrinkWrap: true, scrollDirection: Axis.horizontal, padding: EdgeInsets.symmetric(horizontal: 15.w)) */}
        <div
          className="flex overflow-x-auto"
          style={{ paddingLeft: '15px', paddingRight: '15px' }}
        >
          {activeVipPlans.map((plan, index) => {
            const isSelected = selectedVipPlan?.id === plan.id;

            // Debug: Log selection state for each plan
            console.log(`Plan ${index}:`, {
              planId: plan.id,
              selectedVipPlanId: selectedVipPlan?.id,
              isSelected,
              planIdType: typeof plan.id,
              selectedIdType: typeof selectedVipPlan?.id
            });

            // Exact Flutter field mapping from VipPlansModel
            const validityPeriod = plan.validity_period || 30;
            const originalPrice = parseFloat(plan.price || '0');
            const discountedPrice = parseFloat(plan.discount_price || plan.price || '0');

            // Flutter calculation: String duration = ((data.validityPeriod ?? 0) ~/ 30).toString();
            const monthDuration = Math.floor(validityPeriod / 30);

            // Flutter discount calculation function: getDiscountPercentageFunction(plan.price ?? '0', plan.discountPrice ?? '0')
            const discountPercentage = originalPrice > discountedPrice
              ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
              : 0;

            return (
              /* Flutter: InkWell with Container */
              <div
                key={plan.id}
                className="cursor-pointer"
                style={{
                  marginLeft: '7px', // Flutter: margin: EdgeInsets.symmetric(horizontal: 7.w)
                  marginRight: '7px'
                }}
                onClick={() => {
                  console.log('🔄 VIPPlansSection: Card clicked!', plan.id);
                  handleVipPlanSelect(plan);
                }}
              >
                {/* Flutter: Container with white background and rounded corners */}
                <div
                  className="rounded-lg"
                  style={{
                    paddingLeft: '14px', // Flutter: padding: EdgeInsets.only(left: 14.w, right: 8.w)
                    paddingRight: '8px',
                    width: '180px', // Flutter: width: 180.w
                    height: '70px', // Container height matches parent
                    backgroundColor: '#FFFFFF', // Flutter: color: AppColor.white
                    borderRadius: '8px' // Flutter: borderRadius: BorderRadius.circular(8)
                  }}
                >
                  {/* Flutter: Column with crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center */}
                  <div className="flex flex-col justify-center h-full">

                    {/* Flutter: Padding with Row for plan duration and radio button */}
                    <div
                      className="flex items-center justify-between"
                      style={{ paddingTop: '3px', paddingBottom: '3px' }} // Flutter: padding: EdgeInsets.symmetric(vertical: 3.h)
                    >
                      {/* Flutter: AppText.bold14("${(plan.validityPeriod ?? 0) ~/ 30} ${appLocalization.monthPlan}") */}
                      <span className="font-bold text-sm text-black">
                        {monthDuration} Month Plan
                      </span>

                      {/* Flutter: Container with tick or circle - Radio Button */}
                      <div
                        className="flex items-center justify-center rounded-full border-2 cursor-pointer"
                        style={{
                          height: '18px',
                          width: '18px',
                          backgroundColor: isSelected ? '#FFA300' : '#FFFFFF',
                          borderColor: isSelected ? '#FFA300' : 'rgba(117, 117, 117, 0.3)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVipPlanSelect(plan);
                        }}
                      >
                        {isSelected && (
                          // Flutter: Image.asset(appAssets.tick) - White checkmark
                          <span className="text-white text-xs font-bold">✓</span>
                        )}
                      </div>
                    </div>

                    {/* Flutter: Row with pricing information */}
                    <div className="flex items-center">
                      {/* Flutter: AppText.bold14(CurrencyManager.formatCurrency(plan.discountPrice ?? '0')) */}
                      <span className="font-bold text-sm text-black">
                        ₹{Math.round(discountedPrice)}
                      </span>

                      {/* Flutter: SizedBox(width: 7.w) */}
                      <div style={{ width: '7px' }}></div>

                      {/* Flutter: AppText.regular14(CurrencyManager.formatCurrency(plan.price ?? '0'), color: Color.fromRGBO(117, 117, 117, 1), lineThrough: true) */}
                      <span
                        className="text-sm line-through"
                        style={{ color: 'rgb(117, 117, 117)' }} // Flutter: Color.fromRGBO(117, 117, 117, 1)
                      >
                        ₹{Math.round(originalPrice)}
                      </span>

                      {/* Flutter: SizedBox(width: 8.w) */}
                      <div style={{ width: '8px' }}></div>

                      {/* Flutter: Container with discount percentage */}
                      <div
                        className="flex items-center justify-center rounded"
                        style={{
                          height: '25px', // Flutter: height: 25.h
                          width: '60px', // Flutter: width: 60.w
                          borderRadius: '4px', // Flutter: borderRadius: BorderRadius.circular(4.h)
                          backgroundColor: '#E8F5E8' // Flutter: color: AppColor.lightGreen
                        }}
                      >
                        {/* Flutter: AppText.bold12("${getDiscountPercentageFunction(plan.price ?? '0', plan.discountPrice ?? '0')}", color: AppColor.green) */}
                        <span
                          className="font-bold text-xs"
                          style={{ color: '#4CAF50' }} // Flutter: color: AppColor.green
                        >
                          {discountPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flutter: SizedBox(height: 14.h) */}
      <div style={{ height: '14px' }}></div>

      {/* Flutter: AppText.regular16(appLocalization.subscribeAndSaveUpto6000, color: AppColor.white) */}
      <div className="text-center">
        <span className="text-white text-base font-normal">
          Subscribe & save upto ₹6000*
        </span>
      </div>
    </div>
  );
};

export default VIPPlansSection;